// Types of response docs coming from /response-api/responses
export type AnswerDoc = {
  id: string;
  name?: string;
  email?: string;
  category_name: string;
  survey_name: string;
  // answers: [{ question, answer: [...] }]
  answers: { question: string; answer: (string | number)[] }[];
  createdAt?: string;
};

// Build lists for filters
export function getCatalog(docs: AnswerDoc[]) {
  const categories = new Set<string>();
  const surveysByCat = new Map<string, Set<string>>();
  docs.forEach(d => {
    categories.add(d.category_name);
    if (!surveysByCat.has(d.category_name)) surveysByCat.set(d.category_name, new Set());
    surveysByCat.get(d.category_name)!.add(d.survey_name);
  });
  return {
    categories: Array.from(categories).sort(),
    surveysByCat: new Map(
      Array.from(surveysByCat.entries()).map(([k, v]) => [k, Array.from(v).sort()])
    )
  };
}

// Aggregate per (category::survey) → per-question tallies
export function aggregate(docs: AnswerDoc[]) {
  type QStats = { counts: Record<string, number>; total: number; sum?: number }; // sum for rating averages
  type SurveyAgg = { totalResponses: number; byQuestion: Record<string, QStats> };

  const agg = new Map<string, SurveyAgg>();

  for (const doc of docs) {
    const key = `${doc.category_name}::${doc.survey_name}`;
    if (!agg.has(key)) agg.set(key, { totalResponses: 0, byQuestion: {} });
    const s = agg.get(key)!;
    s.totalResponses++;

    for (const qa of doc.answers) {
      const q = (s.byQuestion[qa.question] ??= { counts: {}, total: 0, sum: 0 });
      // Normalize every stored answer into string buckets; keep numeric sum for rating
      for (const val of qa.answer ?? []) {
        const bucket = String(val);
        q.counts[bucket] = (q.counts[bucket] ?? 0) + 1;
        q.total++;
        const num = Number(val);
        if (!Number.isNaN(num)) q.sum = (q.sum ?? 0) + num;
      }
    }
  }

  return agg; // Map<"Category::Survey", { totalResponses, byQuestion }>
}

// Build chart-friendly rows for a given question
export function rowsForQuestion(qstats: { counts: Record<string, number> }, totalResponses: number) {
  const entries = Object.entries(qstats.counts)
    .sort((a, b) => b[1] - a[1]); // desc by count
  return entries.map(([opt, count]) => ({
    opt,
    count,
    pct: totalResponses ? Math.round((count / totalResponses) * 100) : 0
  }));
}

// Compute average (for rating-like numeric answers)
export function averageFrom(qstats: { total: number; sum?: number }) {
  if (!qstats.total || !qstats.sum) return null;
  return +(qstats.sum / qstats.total).toFixed(2);
}

// Build CSV (either for a single survey or all)
export function toCsv(docs: AnswerDoc[], filter?: { category?: string; survey?: string }) {
  const filtered = docs.filter(d => {
    if (filter?.category && d.category_name !== filter.category) return false;
    if (filter?.survey && d.survey_name !== filter.survey) return false;
    return true;
  });

  // Find union of all question texts to make columns
  const questionSet = new Set<string>();
  filtered.forEach(d => d.answers.forEach(a => questionSet.add(a.question)));
  const questions = Array.from(questionSet);

  // CSV header
  const header = [
    "id",
    "name",
    "email",
    "category",
    "survey",
    ...questions
  ];

  const rows = filtered.map(d => {
    const map = new Map<string, string>();
    d.answers.forEach(a => map.set(a.question, (a.answer ?? []).join(" | ")));
    return [
      safe(d.id),
      safe(d.name || ""),
      safe(d.email || ""),
      safe(d.category_name),
      safe(d.survey_name),
      ...questions.map(q => safe(map.get(q) || ""))
    ].join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");
  return csv;
}

function safe(s: string) {
  // escape quotes and wrap if needed
  const needs = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needs ? `"${escaped}"` : escaped;
}
