"""Django management command: import hardcoded frontend course content
into the backend DB.

Why: Academy content lives in
  frontend/src/data/academy/courses/*.ts

as TypeScript literals (~12 courses, 35 modules, 220 lessons). The
gated-LMS (Phase 1/2/3) requires matching CourseModule + CourseLesson
DB rows so that Enrollment.certificate_eligibility() has something to
count.

Rather than write hand-mirrored rows in a migration (which goes stale
the moment the frontend changes), we read the TS files via node at
deploy time and upsert them. Safe to re-run: uses update_or_create.

Usage:
  python manage.py import_frontend_courses

Requires node on PATH (the container image has node installed for the
frontend build stage; this command reuses it).
"""
import json
import subprocess
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from academy.models import (
    Course,
    CourseCategory,
    CourseModule,
    CourseLesson,
    Exam,
    PracticeAssignment,
)


# Path to the frontend course-extractor script bundled with this package.
# Written to a tmpfile at run time — keeps us from introducing a new
# dependency on the frontend filesystem layout at module-import time.
EXTRACTOR_JS = r"""
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = process.argv[2];
const files = readdirSync(DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');

function pluck(regex, src) {
  const m = regex.exec(src);
  return m ? m[1] : null;
}

const courses = [];
for (const f of files) {
  const src = readFileSync(join(DIR, f), 'utf8');
  const courseConst = /const\s+\w*[Cc]ourse\s*:\s*Course\s*=\s*\{([\s\S]+?)^};$/m.exec(src);
  if (!courseConst) continue;
  const cb = courseConst[1];
  const course = {
    id: pluck(/\bid:\s*['"`]([^'"`]+)['"`]/, cb),
    title: pluck(/\btitle:\s*['"`]([^'"`]+)['"`]/, cb),
    titleNL: pluck(/\btitleNL:\s*['"`]([^'"`]+)['"`]/, cb),
    description: pluck(/\bdescription:\s*['"`]([^'"`]+)['"`]/, cb),
    modules: [],
  };

  // Walk modules
  const moduleBlocks = [...src.matchAll(/const\s+module\w*\s*:\s*Module\s*=\s*\{([\s\S]+?)^};$/gm)];
  for (const mm of moduleBlocks) {
    const body = mm[1];
    const mod = {
      id: pluck(/\bid:\s*['"`]([^'"`]+)['"`]/, body),
      title: pluck(/\btitle:\s*['"`]([^'"`]+)['"`]/, body),
      titleNL: pluck(/\btitleNL:\s*['"`]([^'"`]+)['"`]/, body),
      order: parseInt(pluck(/\border:\s*(\d+)/, body) || '0', 10),
      lessons: [],
    };

    // Walk lessons inside this module's lessons: [...] block
    const lessonsStart = body.indexOf('lessons:');
    if (lessonsStart >= 0) {
      let i = body.indexOf('[', lessonsStart);
      if (i >= 0) {
        let depth = 1;
        let j = i + 1;
        let objStart = -1;
        let objDepth = 0;
        const blocks = [];
        for (; j < body.length && depth > 0; j++) {
          const c = body[j];
          if (c === '[') depth++;
          else if (c === ']') depth--;
          else if (c === '{') {
            if (depth === 1 && objDepth === 0) objStart = j;
            objDepth++;
          } else if (c === '}') {
            objDepth--;
            if (objDepth === 0 && objStart >= 0) {
              blocks.push(body.slice(objStart, j + 1));
              objStart = -1;
            }
          }
        }
        let order = 0;
        for (const lb of blocks) {
          // Best-effort raw quiz block (used by both quiz and exam lessons)
          // Counts the JSON-ish array length for question count; full
          // structure is preserved via raw text.
          let quizQuestionCount = 0;
          const qm = /\bquiz:\s*\[([\s\S]*?)\n\s*\]\s*,?/m.exec(lb);
          if (qm) {
            // Count top-level objects inside the quiz array.
            const inner = qm[1];
            let depth = 0;
            for (let k = 0; k < inner.length; k++) {
              const ch = inner[k];
              if (ch === '{') {
                if (depth === 0) quizQuestionCount++;
                depth++;
              } else if (ch === '}') {
                depth--;
              }
            }
          }
          mod.lessons.push({
            id: pluck(/\bid:\s*['"`]([^'"`]+)['"`]/, lb),
            title: pluck(/\btitle:\s*['"`]([^'"`]+)['"`]/, lb),
            titleNL: pluck(/\btitleNL:\s*['"`]([^'"`]+)['"`]/, lb),
            type: pluck(/\btype:\s*['"`]([^'"`]+)['"`]/, lb) || 'video',
            duration: pluck(/\bduration:\s*['"`]([^'"`]+)['"`]/, lb) || '10:00',
            videoUrl: pluck(/\bvideoUrl:\s*['"`]([^'"`]*)['"`]/, lb) || '',
            transcript: pluck(/\btranscript:\s*`([\s\S]*?)`/, lb) || '',
            content: pluck(/\bcontent:\s*`([\s\S]*?)`/, lb) || '',
            // Practice-specific fields (best-effort)
            assignment: pluck(/\bassignment:\s*['"`]([^'"`]*)['"`]/, lb)
              || pluck(/\bassignment:\s*`([\s\S]*?)`/, lb) || '',
            rubric: pluck(/\brubric:\s*['"`]([^'"`]*)['"`]/, lb)
              || pluck(/\brubric:\s*`([\s\S]*?)`/, lb) || '',
            quizQuestionCount: quizQuestionCount,
            order: order++,
          });
        }
      }
    }
    course.modules.push(mod);
  }
  courses.push(course);
}
process.stdout.write(JSON.stringify(courses));
"""


class Command(BaseCommand):
    help = 'Import hardcoded frontend academy courses into backend DB.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--frontend-dir',
            default=None,
            help='Path to frontend/src/data/academy/courses/. '
                 'Auto-detected if running from repo root.',
        )

    def handle(self, *args, **opts):
        # Auto-detect frontend dir
        repo_root = Path(__file__).resolve().parents[4]  # backend/academy/management/commands/
        candidates = [
            opts['frontend_dir'] and Path(opts['frontend_dir']),
            repo_root / 'frontend' / 'src' / 'data' / 'academy' / 'courses',
            repo_root.parent / 'frontend' / 'src' / 'data' / 'academy' / 'courses',
            Path('/app/frontend/src/data/academy/courses'),
        ]
        frontend_dir = next((p for p in candidates if p and p.exists()), None)
        if not frontend_dir:
            self.stderr.write('Could not find frontend courses dir. '
                              'Pass --frontend-dir explicitly.')
            return

        self.stdout.write(f'Reading from {frontend_dir}')

        # Write the extractor to a tmp file + invoke node
        import tempfile
        with tempfile.NamedTemporaryFile('w', suffix='.mjs', delete=False) as t:
            t.write(EXTRACTOR_JS)
            extractor_path = t.name

        try:
            result = subprocess.run(
                ['node', extractor_path, str(frontend_dir)],
                capture_output=True, text=True, timeout=60,
            )
        finally:
            Path(extractor_path).unlink(missing_ok=True)

        if result.returncode != 0:
            self.stderr.write(f'Extractor failed: {result.stderr}')
            return

        courses = json.loads(result.stdout)
        self.stdout.write(f'Parsed {len(courses)} courses from frontend')

        # Upsert category
        category, _ = CourseCategory.objects.get_or_create(
            slug='project-management',
            defaults={'name': 'Project Management', 'icon': 'Briefcase', 'order': 1},
        )

        mods_created = lessons_created = 0
        exams_created = practices_created = 0
        warnings: list[str] = []

        with transaction.atomic():
            for fc in courses:
                # Match backend Course by slug (frontend.id == backend.slug)
                course = Course.objects.filter(slug=fc['id']).first()
                if not course:
                    self.stdout.write(f'  SKIP {fc["id"]}: no backend Course row '
                                      '(run migration 0014 first)')
                    continue

                # Optionally refresh title/desc if missing
                if not course.title_nl and fc.get('titleNL'):
                    course.title_nl = fc['titleNL']
                    course.save(update_fields=['title_nl'])

                # Upsert modules + lessons
                for m_order, fm in enumerate(fc['modules']):
                    mod, mc = CourseModule.objects.update_or_create(
                        course=course,
                        order=fm.get('order', m_order),
                        defaults={
                            'title': fm['title'],
                            'title_nl': fm.get('titleNL') or fm['title'],
                            'description': '',
                        },
                    )
                    if mc: mods_created += 1

                    for l_order, fl in enumerate(fm['lessons']):
                        # Lesson type from frontend may be lowercase like 'video',
                        # 'quiz', 'exam', 'pdf', 'docx', etc. — use directly.
                        body = fl.get('transcript') or fl.get('content') or ''
                        # Parse duration "10:00" → minutes
                        try:
                            mins = int(fl.get('duration', '10:00').split(':')[0])
                        except (ValueError, IndexError):
                            mins = 10

                        lesson_type = fl.get('type', 'video')
                        lesson, lc = CourseLesson.objects.update_or_create(
                            module=mod,
                            order=l_order,
                            defaults={
                                'title': fl['title'],
                                'title_nl': fl.get('titleNL') or fl['title'],
                                'lesson_type': lesson_type,
                                'duration_minutes': mins,
                                'video_url': fl.get('videoUrl', ''),
                                'content': body,
                                'content_nl': body,  # NL fallback = same; translate later
                            },
                        )
                        if lc: lessons_created += 1

                        # === Fix 2 — PracticeAssignment for practice lessons
                        # The TS files describe practice exercises inline on
                        # the lesson; we mirror that into a PracticeAssignment
                        # row so Enrollment.certificate_eligibility() can gate
                        # on admin-approved submissions.
                        if lesson_type == 'practice':
                            description = (
                                fl.get('assignment')
                                or body
                                or 'Complete the practice exercise as described in the lesson.'
                            )
                            rubric_text = fl.get('rubric') or ''
                            criteria = {'rubric': rubric_text} if rubric_text else {}
                            _, pc = PracticeAssignment.objects.update_or_create(
                                lesson=lesson,
                                defaults={
                                    'title': fl['title'],
                                    'description': description,
                                    'course': course,
                                    'duration_minutes': mins,
                                    'criteria': criteria,
                                },
                            )
                            if pc: practices_created += 1

                        # === Fix 3/4 — Exam row for exam lessons
                        # Without a matching Exam row, the cert-eligibility
                        # check treats the course as exam-free, and the
                        # exam-taking UI has nothing to query.
                        if lesson_type == 'exam':
                            qcount = fl.get('quizQuestionCount') or 0
                            _, ec = Exam.objects.update_or_create(
                                course=course,
                                module=mod,
                                title=fl['title'],
                                defaults={
                                    'title_nl': fl.get('titleNL') or fl['title'],
                                    'description': body[:2000],
                                    'description_nl': body[:2000],
                                    'passing_score': 80,
                                    'time_limit': mins or 45,
                                    'max_attempts': 3,
                                    # Question content lives in the TS file
                                    # next to the lesson; for now we record
                                    # the count and let quiz_exam_api fetch
                                    # the actual questions out of the lesson.
                                    'questions': {'frontend_count': qcount},
                                    'is_active': True,
                                },
                            )
                            if ec: exams_created += 1

                # === Fix 4 — sanity-check exam wiring per course
                # If the course already has Exam rows but no exam-typed
                # lessons (the historical state for SAFe / Program Mgmt /
                # MS Project / Leadership before today's TS fix), warn so
                # the QA gate can flag it.
                has_exam_row = Exam.objects.filter(course=course).exists()
                has_exam_lesson = CourseLesson.objects.filter(
                    module__course=course, lesson_type='exam'
                ).exists()
                if has_exam_row and not has_exam_lesson:
                    warnings.append(
                        f'  WARN {course.slug}: has Exam row(s) but no '
                        'exam-type lesson in modules. Update the TS file '
                        'to include a {type:"exam"} lesson.'
                    )

        for w in warnings:
            self.stdout.write(self.style.WARNING(w))

        self.stdout.write(self.style.SUCCESS(
            f'Imported: {mods_created} modules, {lessons_created} lessons, '
            f'{practices_created} practice assignments, {exams_created} exams'
        ))
