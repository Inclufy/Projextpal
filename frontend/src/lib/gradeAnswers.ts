/**
 * Order-insensitive equality between a question's selected answer ids and its
 * correct answer ids. Copies the arrays before sorting (no mutation) and uses a
 * stable string comparator so numeric and string ids compare consistently.
 * Shared by QuizEngine and ExamEngine. See SonarQube S2871.
 */
type AnswerId = string | number;

export function answersMatch(
  selected: ReadonlyArray<AnswerId>,
  correct: ReadonlyArray<AnswerId>,
): boolean {
  const byId = (a: AnswerId, b: AnswerId) => String(a).localeCompare(String(b));
  return (
    JSON.stringify([...selected].sort(byId)) ===
    JSON.stringify([...correct].sort(byId))
  );
}
