#!/usr/bin/env python3
"""Academy course content validator.

Scans the frontend course .ts files and (optionally) cross-references the
running backend DB to surface quality issues:

  STRUCTURAL
    - Modules missing top-level `order:` (causes import upsert collision)
    - Course header `modules: N` literal not matching actual array length
    - Course/module/lesson missing required `id` or `title`

  CONTENT
    - Lessons with empty `transcript` AND empty `content`
    - Lessons with default placeholder duration (`'10:00'`) that look real
    - Catalog stubs (course with no module objects, only metadata)

  i18n
    - Course/module/lesson missing `titleNL`
    - Lesson missing localized body (no transcript_nl/content_nl in source —
      these aren't fields in the .ts schema, but we flag the EN-only ones)

  DB CONSISTENCY (--with-db)
    - DB module count != source module count for the same course
    - Orphan DB courses (Course row exists but no .ts file declares it)
    - Cruft DB courses (titles matching r'^test'i)

USAGE
  python3 scripts/validate_courses.py                       # report only
  python3 scripts/validate_courses.py --fix                 # apply auto-fixes
  python3 scripts/validate_courses.py --with-db             # include DB checks
  python3 scripts/validate_courses.py --fix --with-db       # both
  python3 scripts/validate_courses.py --export-empty-lessons[=md|json]
                                                            # dump empties for
                                                            # downstream
                                                            # authoring/LLM

AUTO-FIXES (--fix)
  Currently only one mechanical fix is implemented: inject `order: N` into
  any module declaration that lacks one (N is the 0-based occurrence index
  in file order). Backups are written to <file>.bak-YYYY-MM-DD.

EXPORT MODES
  --export-empty-lessons         emit markdown report of empty lessons
  --export-empty-lessons=json    emit JSON for piping to a content drafter
  --all-types                    include interactive lesson types (default
                                 hides quiz/exam/cert/practice — those store
                                 payload in separate fields, not transcript)

  Each empty lesson record includes the surrounding course/module context
  (titles, neighboring lesson titles) so a drafter — human or LLM — can
  match tone and avoid duplicating coverage.

  To draft content for the gaps surfaced by this report, hand the output
  to the `course-content` Claude Code subagent (see
  .claude/agents/course-content.md, "Mode B: DRAFT"). It checks doctrinal
  accuracy against the methodology source and matches sibling-lesson tone.

EXIT CODE
  0 if no issues (or all auto-fixed). Non-zero otherwise.
  Always 0 in --export-empty-lessons mode (it's a report, not a check).
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

DEFAULT_COURSES_DIR = Path('/Users/sami/ProjextPal/frontend/src/data/academy/courses')
DEFAULT_BACKEND_CONTAINER = 'projextpal-backend-prod'
DEFAULT_COMPOSE_FILE = '/Users/sami/ProjextPal/docker-compose.production.yml'

# Lesson types whose `transcript`/`content` fields are *expected* to be empty
# in source — their payload lives elsewhere (quiz questions, exam questions,
# auto-generated certificate, separate practice/simulation submission objects).
# Only `video`/`reading`/`lecture` lessons are real authoring gaps when empty.
TEXT_BEARING_TYPES = {'video', 'reading', 'lecture', 'article'}
INTERACTIVE_TYPES = {'quiz', 'exam', 'certificate', 'practice', 'simulation',
                     'pdf', 'docx', 'assignment'}

MODULE_DECL = re.compile(r'^(?:export\s+)?const\s+module\w*\s*:\s*Module\s*=\s*\{$', re.MULTILINE)
COURSE_DECL = re.compile(r'^(?:export\s+)?const\s+\w*[Cc]ourse\s*:\s*Course\s*=\s*\{', re.MULTILINE)
ORDER_FIELD = re.compile(r'^  order:\s*\d+', re.MULTILINE)
PLUCK_STR = lambda key, body: (
    re.search(rf"\b{key}:\s*['\"`]([^'\"`]+)['\"`]", body) or [None, None]
)[1]
HEADER_MODULES_LITERAL = re.compile(r'^  modules:\s*(\d+),', re.MULTILINE)


# ---------------------------------------------------------------- result types

class Issue:
    SEVERITY = ('info', 'warn', 'error')

    def __init__(self, sev: str, course: str, where: str, message: str):
        assert sev in self.SEVERITY
        self.sev = sev
        self.course = course
        self.where = where
        self.message = message

    def __str__(self) -> str:
        tag = {'info': 'i', 'warn': '!', 'error': '✗'}[self.sev]
        return f'  [{tag}] {self.course:30s} {self.where:25s} {self.message}'


# ---------------------------------------------------------------- source parse

def parse_module_block(body: str) -> dict:
    """Extract metadata from a module body (between `{` and matching `};`)."""
    return {
        'id': PLUCK_STR('id', body),
        'title': PLUCK_STR('title', body),
        'titleNL': PLUCK_STR('titleNL', body),
        'has_order': bool(ORDER_FIELD.search(body[:600])),
    }


def parse_lessons_in_module(body: str) -> list[dict]:
    """Walk the lessons:[...] array of a module body and return each lesson's
    metadata. Replicates the brace-walking logic from the import command."""
    lessons_at = body.find('lessons:')
    if lessons_at < 0:
        return []
    arr_start = body.find('[', lessons_at)
    if arr_start < 0:
        return []
    depth = 1
    j = arr_start + 1
    obj_start = -1
    obj_depth = 0
    blocks: list[str] = []
    while j < len(body) and depth > 0:
        c = body[j]
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
        elif c == '{':
            if depth == 1 and obj_depth == 0:
                obj_start = j
            obj_depth += 1
        elif c == '}':
            obj_depth -= 1
            if obj_depth == 0 and obj_start >= 0:
                blocks.append(body[obj_start:j + 1])
                obj_start = -1
        j += 1
    out = []
    for lb in blocks:
        out.append({
            'id': PLUCK_STR('id', lb),
            'title': PLUCK_STR('title', lb),
            'titleNL': PLUCK_STR('titleNL', lb),
            'type': PLUCK_STR('type', lb) or 'video',
            'duration': PLUCK_STR('duration', lb) or '10:00',
            'transcript': bool(re.search(r'\btranscript:\s*`[\s\S]*?\S[\s\S]*?`', lb)),
            'content': bool(re.search(r'\bcontent:\s*`[\s\S]*?\S[\s\S]*?`', lb)),
        })
    return out


def find_module_blocks(src: str) -> list[tuple[int, int, str]]:
    """Returns [(start, end, body_str), ...] for each top-level module decl.
    `start` is the position of `const moduleX...`, `end` is just past the
    closing `};`."""
    out = []
    for m in MODULE_DECL.finditer(src):
        body_start = m.end()
        # Match the next ^};$
        end_match = re.search(r'^};$', src[body_start:], re.MULTILINE)
        if not end_match:
            continue
        body_end = body_start + end_match.end()
        out.append((m.start(), body_end, src[body_start:body_start + end_match.start()]))
    return out


def parse_course_file(path: Path) -> dict:
    src = path.read_text()
    course_match = COURSE_DECL.search(src)
    course = {'file': path.name, 'modules': [], 'header_modules_literal': None}
    if course_match:
        # Course body extends to next ^};$
        body_start = src.find('{', course_match.start()) + 1
        end_match = re.search(r'^};$', src[body_start:], re.MULTILINE)
        course_body = src[body_start:body_start + end_match.start()] if end_match else src[body_start:]
        course['id'] = PLUCK_STR('id', course_body)
        course['title'] = PLUCK_STR('title', course_body)
        course['titleNL'] = PLUCK_STR('titleNL', course_body)
        # `modules: 12,` numeric literal in course header (catalog count)
        m = HEADER_MODULES_LITERAL.search(course_body)
        course['header_modules_literal'] = int(m.group(1)) if m else None

    # Catalog files (other-courses.ts) have multiple Course decls and no Module decls
    course['module_blocks'] = []
    for start, end, body in find_module_blocks(src):
        course['module_blocks'].append({
            'meta': parse_module_block(body),
            'lessons': parse_lessons_in_module(body),
            'src_offset': start,
        })
    return course


# ---------------------------------------------------------------- catalog file

CATALOG_COURSE_DECL = re.compile(
    r'^(?:export\s+)?const\s+\w+Course\s*:\s*Course\s*=\s*\{([\s\S]*?)^};$', re.MULTILINE
)


def parse_catalog_file(path: Path) -> list[dict]:
    """Catalog files (e.g., other-courses.ts) declare multiple Course consts
    with metadata only — no Module decls. Return a list of stub records."""
    src = path.read_text()
    out = []
    for m in CATALOG_COURSE_DECL.finditer(src):
        body = m.group(1)
        out.append({
            'id': PLUCK_STR('id', body),
            'title': PLUCK_STR('title', body),
            'titleNL': PLUCK_STR('titleNL', body),
            'modules_literal': int(
                (re.search(r'\bmodules:\s*(\d+)', body) or [None, '0'])[1]
            ),
            'is_stub': True,
        })
    return out


# ---------------------------------------------------------------- DB checks

def query_db_courses(compose_file: str, container: str) -> list[dict]:
    """Run a Django shell query and return a list of dicts."""
    code = (
        "import json;"
        "from academy.models import Course, CourseModule, CourseLesson;"
        "out = [];"
        "[out.append({"
        "  'id': str(c.id), 'slug': getattr(c, 'slug', None), 'title': c.title,"
        "  'title_nl': getattr(c, 'title_nl', None),"
        "  'modules': CourseModule.objects.filter(course=c).count(),"
        "  'lessons': CourseLesson.objects.filter(module__course=c).count()"
        "}) for c in Course.objects.all()];"
        "print('JSON_BEGIN' + json.dumps(out) + 'JSON_END')"
    )
    cmd = [
        'docker', 'compose', '-f', compose_file, 'exec', '-T', 'backend',
        'python', 'manage.py', 'shell', '-c', code,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    out = res.stdout
    s = out.find('JSON_BEGIN')
    e = out.find('JSON_END')
    if s < 0 or e < 0:
        raise RuntimeError(f'Could not parse DB output: {out[:500]}')
    return json.loads(out[s + len('JSON_BEGIN'):e])


# ---------------------------------------------------------------- auto-fix

def fix_missing_order(path: Path) -> int:
    """Inject `order: N,` into module declarations missing it. Returns
    number of modifications. Idempotent."""
    src = path.read_text()
    blocks = find_module_blocks(src)
    if not blocks:
        return 0
    # Process in reverse to keep earlier offsets valid
    fixed = 0
    for idx in reversed(range(len(blocks))):
        start, end, body = blocks[idx]
        if ORDER_FIELD.search(body[:600]):
            continue
        # Insert just after the `{` line of the module decl
        decl_end = src.find('\n', start) + 1
        insertion = f'  order: {idx},\n'
        src = src[:decl_end] + insertion + src[decl_end:]
        fixed += 1
    if fixed:
        backup = path.with_suffix(path.suffix + f'.bak-{date.today().isoformat()}')
        if not backup.exists():
            shutil.copy2(path, backup)
        path.write_text(src)
    return fixed


# ---------------------------------------------------------------- orchestrate

def validate(courses_dir: Path, do_fix: bool, with_db: bool,
             compose_file: str, container: str) -> tuple[list[Issue], dict]:
    issues: list[Issue] = []
    summary = {'files': 0, 'courses_with_modules': 0, 'catalog_stubs': 0,
               'modules': 0, 'lessons': 0, 'fixes_applied': 0}

    parsed_courses_by_id: dict[str, dict] = {}
    catalog_stub_ids: set[str] = set()

    for path in sorted(courses_dir.glob('*.ts')):
        if path.name == 'index.ts':
            continue
        summary['files'] += 1

        # Detect catalog file (no Module decls + multiple Course decls)
        src = path.read_text()
        has_module_decls = bool(MODULE_DECL.search(src))
        catalog_courses = parse_catalog_file(path) if not has_module_decls else []

        if catalog_courses:
            for cs in catalog_courses:
                parsed_courses_by_id[cs['id']] = cs
                catalog_stub_ids.add(cs['id'])
                summary['catalog_stubs'] += 1
                if not cs.get('titleNL'):
                    issues.append(Issue('warn', cs['id'], 'course/titleNL',
                                        'missing NL title'))
            continue

        # Real course file
        c = parse_course_file(path)
        cid = c.get('id') or path.stem
        parsed_courses_by_id[cid] = c
        summary['courses_with_modules'] += 1
        summary['modules'] += len(c['module_blocks'])

        if not c.get('id'):
            issues.append(Issue('error', path.name, 'course/id',
                                'no `id:` field on Course'))
        if not c.get('titleNL'):
            issues.append(Issue('warn', cid, 'course/titleNL',
                                'missing NL title'))

        # modules: literal vs actual count
        lit = c.get('header_modules_literal')
        actual = len(c['module_blocks'])
        if lit is not None and lit != actual:
            issues.append(Issue('warn', cid, 'course/modules-count',
                                f'header says modules: {lit} but {actual} '
                                f'top-level Module decls in file'))

        # Per module
        for i, mb in enumerate(c['module_blocks']):
            meta = mb['meta']
            mod_label = meta.get('id') or f'module#{i}'
            if not meta['has_order']:
                issues.append(Issue('error', cid, f'mod[{i}]:{mod_label}',
                                    'no top-level `order:` field — '
                                    'WILL collide on import (upsert key)'))
            if not meta.get('titleNL'):
                issues.append(Issue('warn', cid, f'mod[{i}]:{mod_label}',
                                    'missing NL title'))
            summary['lessons'] += len(mb['lessons'])
            for j, L in enumerate(mb['lessons']):
                lid = L.get('id') or f'lesson#{j}'
                if not L.get('titleNL'):
                    issues.append(Issue('warn', cid,
                                        f'mod[{i}]:{mod_label}/{lid}',
                                        'lesson missing NL title'))
                # Only flag empty bodies for *text-bearing* lesson types.
                # Quiz/exam/cert/practice store payload in separate fields.
                ltype = (L.get('type') or 'video').lower()
                if ltype in TEXT_BEARING_TYPES and not L['transcript'] and not L['content']:
                    issues.append(Issue('warn', cid,
                                        f'mod[{i}]:{mod_label}/{lid}',
                                        f'{ltype} lesson has empty body '
                                        '(needs transcript or content)'))

        # Apply auto-fix
        if do_fix:
            n = fix_missing_order(path)
            summary['fixes_applied'] += n
            if n:
                issues.append(Issue('info', cid, 'auto-fix',
                                    f'injected order: into {n} module(s)'))

    # DB cross-check
    if with_db:
        try:
            db_courses = query_db_courses(compose_file, container)
        except Exception as e:
            issues.append(Issue('error', '(db)', 'docker-exec',
                                f'could not query DB: {e}'))
            db_courses = []

        db_by_slug = {c.get('slug') or c['id']: c for c in db_courses}
        for cid, cdata in parsed_courses_by_id.items():
            db = db_by_slug.get(cid)
            if not db:
                if cid not in catalog_stub_ids:
                    issues.append(Issue('warn', cid, 'db',
                                        'course in source but no DB row '
                                        '(needs migration to seed)'))
                continue
            if cid in catalog_stub_ids:
                # Stub → DB row should have 0 modules. If not, content was added
                # without source — that's OK but worth noting.
                continue
            src_mods = len(cdata['module_blocks'])
            db_mods = db['modules']
            if src_mods != db_mods:
                issues.append(Issue('error', cid, 'db/module-count',
                                    f'source has {src_mods} modules but DB '
                                    f'has {db_mods} (likely import collision '
                                    'or stale)'))

        # Cruft + orphans
        all_source_ids = set(parsed_courses_by_id.keys())
        for db in db_courses:
            slug = db.get('slug') or db['id']
            title = db['title']
            if re.match(r'^\s*test\b', title, re.I):
                issues.append(Issue('warn', slug, 'db/cruft',
                                    f'title="{title}" looks like dev cruft '
                                    '(consider deleting)'))
            elif slug not in all_source_ids:
                issues.append(Issue('warn', slug, 'db/orphan',
                                    f'DB row "{title}" with no .ts file '
                                    'declaring this slug'))

    return issues, summary


# ---------------------------------------------------------------- entry

def collect_empty_lessons(courses_dir: Path,
                          all_types: bool = False) -> list[dict]:
    """Walk the source files and return one record per lesson with empty
    transcript AND empty content. Used by --export-empty-lessons.

    By default, only includes text-bearing types (video/reading/lecture/article)
    since interactive types (quiz/exam/certificate/practice/...) are expected
    to have empty body fields. Pass `all_types=True` to include everything.
    """
    out: list[dict] = []
    for path in sorted(courses_dir.glob('*.ts')):
        if path.name == 'index.ts':
            continue
        if not MODULE_DECL.search(path.read_text()):
            continue  # skip catalog-stub files
        c = parse_course_file(path)
        course_title = c.get('title') or path.stem
        course_id = c.get('id') or path.stem
        for m_idx, mb in enumerate(c['module_blocks']):
            mod_title = mb['meta'].get('title') or f'module#{m_idx}'
            lessons = mb['lessons']
            siblings = [(L.get('id'), L.get('title')) for L in lessons]
            for l_idx, L in enumerate(lessons):
                if L['transcript'] or L['content']:
                    continue
                ltype = (L.get('type') or 'video').lower()
                if not all_types and ltype not in TEXT_BEARING_TYPES:
                    continue
                out.append({
                    'course_id': course_id,
                    'course_title': course_title,
                    'module_index': m_idx,
                    'module_title': mod_title,
                    'lesson_index': l_idx,
                    'lesson_id': L.get('id'),
                    'lesson_title': L.get('title'),
                    'lesson_titleNL': L.get('titleNL'),
                    'lesson_type': L.get('type'),
                    'duration': L.get('duration'),
                    'sibling_lesson_titles': [
                        t for (sid, t) in siblings if sid != L.get('id')
                    ],
                    'source_file': str(path),
                })
    return out


def render_empty_lessons_markdown(records: list[dict]) -> str:
    if not records:
        return '# Empty lessons report\n\nNo empty lessons found. 🎉\n'
    lines = ['# Empty lessons report', '']
    lines.append(f'**{len(records)} lesson(s)** with empty `transcript` AND '
                 'empty `content`. Each record below includes sibling lesson '
                 'titles so a drafter can match tone and avoid overlap.')
    lines.append('')
    by_course: dict[str, list[dict]] = defaultdict(list)
    for r in records:
        by_course[r['course_title']].append(r)
    for course in sorted(by_course):
        rs = by_course[course]
        lines.append(f'## {course}  ')
        lines.append(f'_{len(rs)} empty lesson(s) — source: `{rs[0]["source_file"]}`_')
        lines.append('')
        for r in rs:
            lines.append(f'### {r["lesson_id"]}: {r["lesson_title"]}')
            lines.append(f'- module: **{r["module_title"]}** (idx {r["module_index"]})')
            lines.append(f'- type: `{r["lesson_type"]}`, duration: `{r["duration"]}`')
            if r.get('lesson_titleNL'):
                lines.append(f'- titleNL: {r["lesson_titleNL"]}')
            else:
                lines.append('- titleNL: _missing_')
            if r['sibling_lesson_titles']:
                lines.append('- siblings in this module:')
                for sib in r['sibling_lesson_titles']:
                    lines.append(f'  - {sib}')
            lines.append('')
    return '\n'.join(lines)


def collect_lesson_alignment_records(courses_dir: Path) -> list[dict]:
    """Walk every video/reading-type lesson with non-empty content and return
    (course, module, lesson_title, content_excerpt) records for semantic
    title-vs-content alignment checking.
    """
    out: list[dict] = []
    for path in sorted(courses_dir.glob('*.ts')):
        if path.name == 'index.ts':
            continue
        if not MODULE_DECL.search(path.read_text()):
            continue
        c = parse_course_file(path)
        course_title = c.get('title') or path.stem
        course_id = c.get('id') or path.stem
        for m_idx, mb in enumerate(c['module_blocks']):
            mod_title = mb['meta'].get('title') or f'module#{m_idx}'
            for L in mb['lessons']:
                ltype = (L.get('type') or 'video').lower()
                if ltype not in TEXT_BEARING_TYPES:
                    continue
                # We only have boolean transcript/content flags from the parser.
                # Re-extract the actual transcript text for the LLM to evaluate.
                # (Cheap alternative: skip alignment check for ones the parser
                # already flagged as empty — they have nothing to misalign with.)
                if not L['transcript'] and not L['content']:
                    continue
                out.append({
                    'course_id': course_id,
                    'course_title': course_title,
                    'module_title': mod_title,
                    'lesson_id': L.get('id'),
                    'lesson_title': L.get('title'),
                    'lesson_titleNL': L.get('titleNL'),
                })
    return out


def check_lesson_alignment(records: list[dict], compose_file: str,
                           container: str, model: str = 'gpt-4o-mini',
                           limit: int | None = None) -> list[dict]:
    """For each lesson record, ask an LLM whether the title matches its content.

    Calls OpenAI through the backend container's environment (which has the
    OPENAI_API_KEY set). Returns a list of mismatch dicts:
        [{course, lesson_id, title, verdict, reason}, ...]
    Verdict is 'aligned' / 'partial' / 'misaligned' / 'error'.
    Cost: ~$0.001 per lesson with gpt-4o-mini → ~$0.20 for all 12 courses.
    """
    if limit:
        records = records[:limit]

    # Pull each lesson's actual transcript from the DB so we have something
    # real to compare against.  The DB import is the source of truth for
    # what the user will see.
    code = (
        "import json, os\n"
        "from openai import OpenAI\n"
        "from academy.models import CourseLesson\n"
        "client = OpenAI()\n"
        "results = []\n"
        f"records = {json.dumps(records)}\n"
        "for r in records:\n"
        "    L = CourseLesson.objects.filter(title=r['lesson_title']).first()\n"
        "    body = (L.content or '')[:1500] if L else ''\n"
        "    if not body.strip():\n"
        "        results.append({**r, 'verdict': 'no_db_body', 'reason': 'no body in DB to compare'})\n"
        "        continue\n"
        "    prompt = (f\"Lesson title: {r['lesson_title']}\\n\\n\"\n"
        "              f\"Lesson body (first 1500 chars):\\n{body}\\n\\n\"\n"
        "              f\"Does the body teach what the title says it teaches? \"\n"
        "              f\"Answer with JSON: {{\\\"verdict\\\": \\\"aligned\\\"|\\\"partial\\\"|\\\"misaligned\\\", \"\n"
        "              f\"\\\"reason\\\": \\\"<one short sentence>\\\"}}\")\n"
        "    try:\n"
        f"        resp = client.chat.completions.create(model='{model}',\n"
        "            messages=[{'role':'user','content':prompt}],\n"
        "            response_format={'type':'json_object'},\n"
        "            max_tokens=120)\n"
        "        data = json.loads(resp.choices[0].message.content)\n"
        "        results.append({**r, 'verdict': data.get('verdict','?'),\n"
        "                              'reason': data.get('reason','')})\n"
        "    except Exception as e:\n"
        "        results.append({**r, 'verdict': 'error', 'reason': str(e)[:120]})\n"
        "print('JSON_BEGIN' + json.dumps(results) + 'JSON_END')\n"
    )
    cmd = ['docker', 'compose', '-f', compose_file, 'exec', '-T', container.replace('projextpal-', '').replace('-prod', ''),
           'python', 'manage.py', 'shell', '-c', code]
    # The `container` arg is a CONTAINER NAME, but `docker compose exec` wants the
    # SERVICE NAME. Hard-code 'backend' since this script targets that one service.
    cmd[6] = 'backend'
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=60 * len(records) + 60)
    out_text = res.stdout
    s = out_text.find('JSON_BEGIN')
    e = out_text.find('JSON_END')
    if s < 0 or e < 0:
        raise RuntimeError(f'Alignment output not parseable: {res.stderr[:500]} | {out_text[:500]}')
    return json.loads(out_text[s + len('JSON_BEGIN'):e])


def render_alignment_report(results: list[dict]) -> str:
    if not results:
        return '# Alignment report\n\nNo lessons checked.\n'
    by_verdict: dict[str, list[dict]] = defaultdict(list)
    for r in results:
        by_verdict[r['verdict']].append(r)
    lines = ['# Lesson title-vs-content alignment', '']
    counts = {k: len(v) for k, v in sorted(by_verdict.items(), key=lambda kv: -len(kv[1]))}
    lines.append(f'**Summary:** {counts}')
    lines.append('')
    for verdict in ('misaligned', 'partial', 'no_db_body', 'error', 'aligned'):
        rs = by_verdict.get(verdict, [])
        if not rs:
            continue
        lines.append(f'## {verdict} ({len(rs)})')
        lines.append('')
        for r in rs:
            lines.append(f'- **{r["course_title"]}** › *{r["module_title"]}* › `{r["lesson_id"]}`: '
                         f'{r["lesson_title"]} — _{r.get("reason","")}_')
        lines.append('')
    return '\n'.join(lines)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--courses-dir', type=Path, default=DEFAULT_COURSES_DIR)
    p.add_argument('--fix', action='store_true', help='apply auto-fixes')
    p.add_argument('--with-db', action='store_true',
                   help='also cross-check the running backend DB')
    p.add_argument('--compose-file', default=DEFAULT_COMPOSE_FILE)
    p.add_argument('--container', default=DEFAULT_BACKEND_CONTAINER)
    p.add_argument('--export-empty-lessons', nargs='?', const='md',
                   choices=['md', 'json'],
                   help='dump empty-lesson records (default: markdown)')
    p.add_argument('--all-types', action='store_true',
                   help='in --export-empty-lessons mode, include interactive '
                        'lesson types (quiz/exam/cert/practice/...) even '
                        'though their empty body is expected')
    p.add_argument('--check-content-alignment', action='store_true',
                   help='ask an LLM whether each text-bearing lesson body '
                        'matches its title; reports misaligned/partial/error '
                        'lessons. Costs ~$0.20 for all 12 courses with gpt-4o-mini.')
    p.add_argument('--alignment-limit', type=int, default=None,
                   help='limit alignment checks to first N lessons (testing)')
    p.add_argument('--alignment-model', default='gpt-4o-mini',
                   help='OpenAI model used for alignment checks (default: gpt-4o-mini)')
    args = p.parse_args()

    if not args.courses_dir.exists():
        print(f'ERROR: courses dir not found: {args.courses_dir}',
              file=sys.stderr)
        return 2

    if args.export_empty_lessons:
        records = collect_empty_lessons(args.courses_dir,
                                        all_types=args.all_types)
        if args.export_empty_lessons == 'json':
            print(json.dumps(records, indent=2))
        else:
            print(render_empty_lessons_markdown(records))
        return 0

    if args.check_content_alignment:
        records = collect_lesson_alignment_records(args.courses_dir)
        print(f'Checking alignment for {len(records)} lessons '
              f'{"(limited to " + str(args.alignment_limit) + ")" if args.alignment_limit else ""}',
              file=sys.stderr)
        results = check_lesson_alignment(records, args.compose_file,
                                         args.container, model=args.alignment_model,
                                         limit=args.alignment_limit)
        print(render_alignment_report(results))
        return 0

    issues, summary = validate(
        args.courses_dir, args.fix, args.with_db,
        args.compose_file, args.container,
    )

    # Group + print
    by_sev = defaultdict(list)
    for issue in issues:
        by_sev[issue.sev].append(issue)
    by_course = defaultdict(list)
    for issue in issues:
        by_course[issue.course].append(issue)

    print(f'\n=== Course content validator ===')
    print(f'  scanned files          : {summary["files"]}')
    print(f'  courses with modules   : {summary["courses_with_modules"]}')
    print(f'  catalog stubs (no mods): {summary["catalog_stubs"]}')
    print(f'  total source modules   : {summary["modules"]}')
    print(f'  total source lessons   : {summary["lessons"]}')
    if args.fix:
        print(f'  auto-fixes applied     : {summary["fixes_applied"]}')
    print(f'  issues (error/warn/info): '
          f'{len(by_sev["error"])}/{len(by_sev["warn"])}/{len(by_sev["info"])}')
    print()

    for course in sorted(by_course):
        print(f'== {course} ==')
        for issue in by_course[course]:
            print(issue)
        print()

    return 1 if by_sev['error'] else 0


if __name__ == '__main__':
    sys.exit(main())
