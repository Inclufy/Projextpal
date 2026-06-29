/**
 * Order-insensitive equality between a question's selected answer ids and its
 * correct answer ids. Copies the arrays before sorting (no mutation) and uses a
 * stable string comparator so numeric and string ids compare consistently.
 * Shared by QuizEngine and ExamEngine. See SonarQube S2871.
 */
export function answersMatch(selected: unknown[], correct: unknown[]): boolean {
  const byId = (a: unknown, b: unknown) => String(a).localeCompare(String(b));
  return (
    JSON.stringify([...selected].sort(byId)) ===
    JSON.stringify([...correct].sort(byId))
  );
}
