/**
 * Map a student's grade (5–12) to question-bank difficulty level (1–4).
 */
function gradeToLevel(grade) {
  const g = Number(grade);
  if (!Number.isFinite(g)) return 2;
  if (g <= 6) return 1;
  if (g <= 8) return 2;
  if (g <= 10) return 3;
  return 4;
}

module.exports = { gradeToLevel };
