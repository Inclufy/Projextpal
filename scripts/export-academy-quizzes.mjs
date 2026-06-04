#!/usr/bin/env node
/**
 * export-academy-quizzes.mjs
 * ---------------------------------------------------------------------------
 * Bridges the static Academy course content (frontend/src/data/academy/courses/*.ts)
 * to the backend quiz/exam delivery layer, which serves questions from JSON
 * fixtures at:
 *     backend/academy/data/quizzes/<lesson_id>.json   (served by get_quiz)
 *     backend/academy/data/exams/<lesson_id>.json     (served by get_exam)
 *
 * Why this exists: import_frontend_courses.py only captures the *count* of quiz
 * questions, not the questions themselves, so the QuizEngine/ExamEngine would
 * otherwise fall back to hardcoded sample questions. This exporter walks every
 * course module, finds lessons of type 'quiz' and 'exam' that carry an inline
 * `quiz: [...]` array, and writes a fixture per lesson keyed by lesson.id.
 *
 * The fixture field shape is a SUPERSET that satisfies BOTH engines:
 *   QuizEngine reads:  textNL??question (NL) / text??questionEN (EN);
 *                      optionsNL??options (NL) / optionsEN??options (EN)
 *   ExamEngine reads:  textNL??text (NL) / text (EN);
 *                      optionsNL??options (NL) / options (EN)
 * So we emit:  text = EN, textNL = NL, options = EN, optionsNL = NL
 *              (+ question/questionEN/optionsEN duplicates for QuizEngine).
 *
 * Source convention (leadership.ts / new content): EN-first —
 *   question (EN) + questionNL (NL), options (EN) + optionsNL (NL),
 *   explanation (EN) + explanationNL (NL), correctAnswer (0-based index).
 * Older NL-only courses have only question/options (no *NL) — handled too.
 *
 * Run from the frontend/ directory:  node ../scripts/export-academy-quizzes.mjs
 */
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const FRONTEND = path.join(REPO_ROOT, 'frontend');

// esbuild is installed in frontend/node_modules, not next to this script.
const frontendRequire = createRequire(path.join(FRONTEND, 'package.json'));
const { build } = frontendRequire('esbuild');
const COURSES_INDEX = path.join(FRONTEND, 'src/data/academy/courses/index.ts');
const QUIZ_OUT = path.join(REPO_ROOT, 'backend/academy/data/quizzes');
const EXAM_OUT = path.join(REPO_ROOT, 'backend/academy/data/exams');

if (!existsSync(COURSES_INDEX)) {
  console.error('Cannot find courses index at', COURSES_INDEX);
  process.exit(1);
}

/** Bundle the TS course index to a temp ESM file, then import it. */
async function loadCourses() {
  const tmp = path.join(os.tmpdir(), `academy-courses-${Date.now()}.mjs`);
  await build({
    entryPoints: [COURSES_INDEX],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: tmp,
    logLevel: 'error',
    absWorkingDir: FRONTEND,
  });
  const mod = await import(pathToFileURL(tmp).href);
  await rm(tmp, { force: true });
  return mod;
}

/** Remap one TS quiz question into the fixture superset shape. */
function remapQuestion(q, idx) {
  const hasNL = q.questionNL != null || q.optionsNL != null;
  const enQuestion = q.question ?? '';
  const nlQuestion = hasNL ? (q.questionNL ?? q.question ?? '') : enQuestion;
  const enOptions = Array.isArray(q.options) ? q.options : [];
  const nlOptions = hasNL && Array.isArray(q.optionsNL) ? q.optionsNL : enOptions;
  const enExpl = q.explanation ?? '';
  const nlExpl = hasNL ? (q.explanationNL ?? q.explanation ?? '') : enExpl;

  const out = {
    id: q.id || `q${idx + 1}`,
    // ExamEngine + QuizEngine EN
    text: enQuestion,
    textNL: nlQuestion,
    // QuizEngine duplicates
    question: nlQuestion,
    questionEN: enQuestion,
    options: enOptions,
    optionsEN: enOptions,
    optionsNL: nlOptions,
    correct: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
    points: 1,
  };
  if (enExpl || nlExpl) {
    out.explanation = enExpl;
    out.explanationNL = nlExpl;
  }
  return out;
}

function buildFixture(course, lesson, isExam) {
  const questions = (lesson.quiz || []).map(remapQuestion);
  const fixture = {
    id: lesson.id,
    title: lesson.title || '',
    titleNL: lesson.titleNL || lesson.title || '',
    courseId: course.id,
    passingScore: 70,
    questions,
  };
  if (isExam) {
    fixture.description = `Final exam — ${course.title}`;
    fixture.descriptionNL = `Eindexamen — ${course.titleNL || course.title}`;
    fixture.timeLimit = 45;
    fixture.maxAttempts = 3;
    fixture.questions.forEach((q) => { q.points = 5; });
  }
  return fixture;
}

async function main() {
  const mod = await loadCourses();
  const courses = mod.courses || mod.default || [];
  const getModules = mod.getModulesByCourseId;
  if (!courses.length || typeof getModules !== 'function') {
    console.error('Could not resolve courses / getModulesByCourseId from bundle');
    process.exit(1);
  }

  await mkdir(QUIZ_OUT, { recursive: true });
  await mkdir(EXAM_OUT, { recursive: true });

  let quizCount = 0;
  let examCount = 0;
  let emptySkipped = 0;
  const summary = [];

  for (const course of courses) {
    const modules = getModules(course.id) || [];
    for (const m of modules) {
      for (const lesson of (m.lessons || [])) {
        const hasQuiz = Array.isArray(lesson.quiz) && lesson.quiz.length > 0;
        if (lesson.type === 'quiz') {
          if (!hasQuiz) { emptySkipped++; continue; }
          const fixture = buildFixture(course, lesson, false);
          await writeFile(path.join(QUIZ_OUT, `${lesson.id}.json`), JSON.stringify(fixture, null, 2));
          quizCount++;
          summary.push(`  quiz  ${course.id} / ${lesson.id} (${fixture.questions.length} q)`);
        } else if (lesson.type === 'exam') {
          if (!hasQuiz) { emptySkipped++; continue; }
          const fixture = buildFixture(course, lesson, true);
          await writeFile(path.join(EXAM_OUT, `${lesson.id}.json`), JSON.stringify(fixture, null, 2));
          examCount++;
          summary.push(`  exam  ${course.id} / ${lesson.id} (${fixture.questions.length} q)`);
        }
      }
    }
  }

  console.log(summary.join('\n'));
  console.log('\n---');
  console.log(`Quiz fixtures written:  ${quizCount}  -> ${path.relative(REPO_ROOT, QUIZ_OUT)}`);
  console.log(`Exam fixtures written:  ${examCount}  -> ${path.relative(REPO_ROOT, EXAM_OUT)}`);
  console.log(`Lessons skipped (empty quiz array): ${emptySkipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
