import { useMemo, useRef, useLayoutEffect } from "react";
import { useResponses } from "../api/surveys";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";

type Resp = {
  _id?: string;
  name?: string;
  email?: string;
  category_name?: string;
  survey_name?: string;
  answers?: { question: string; answer: any[] }[];
};

export default function AdminResponses() {
  // ✅ Hooks at top (order never changes)
  const { token } = useAuth();
  const { data, isLoading, isError } = useResponses({ enabled: !!token });

  // Group by category/survey and compute totals
  const list: Resp[] = Array.isArray(data) ? (data as Resp[]) : [];

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { key: string; category: string; survey: string; rows: Resp[] }
    >();
    list.forEach((r) => {
      const cat = r.category_name ?? "General";
      const sur = r.survey_name ?? "Untitled";
      const k = `${cat}::${sur}`;
      if (!map.has(k)) map.set(k, { key: k, category: cat, survey: sur, rows: [] });
      map.get(k)!.rows.push(r);
    });
    return Array.from(map.values());
  }, [list]);

  const totals = useMemo(() => {
    const totalResponses = list.length;
    const surveysCovered = new Set(
      list.map(
        (r) =>
          `${r.category_name ?? "General"}::${r.survey_name ?? "Untitled"}`
      )
    ).size;
    const totalAnswers = list.reduce(
      (a, r) => a + (r.answers?.length ?? 0),
      0
    );
    return {
      totalResponses,
      surveysCovered,
      avgAnswers: totalResponses ? totalAnswers / totalResponses : 0,
    };
  }, [list]);

  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!listRef.current) return;
    const cards = listRef.current.querySelectorAll(".resp-card");
    if (!cards.length) return; // ✅ guard GSAP
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          ease: "power2.out",
          stagger: 0.06,
        }
      );
    }, listRef);
    return () => ctx.revert();
  }, [groups.length]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Responses</h1>
          <p className="text-xs sm:text-sm text-white/70">
            All collected responses, grouped by survey.
          </p>
        </header>

        {/* Summary */}
        <section className="grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Total responses", value: totals.totalResponses },
            { label: "Surveys with responses", value: totals.surveysCovered },
            {
              label: "Avg answers per response",
              value: totals.avgAnswers.toFixed(1),
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 shadow-[0_0_24px_rgba(91,124,255,.15)]"
            >
              <div className="text-xl sm:text-3xl font-extrabold">
                {m.value}
              </div>
              <div className="mt-1 text-[11px] sm:text-sm text-white/80">
                {m.label}
              </div>
            </div>
          ))}
        </section>

        {/* Groups */}
        {isLoading ? (
          <div className="text-white/80 text-sm">Loading…</div>
        ) : isError ? (
          <div className="text-red-300 text-sm">Failed to load responses.</div>
        ) : (
          <section ref={listRef} className="space-y-5 sm:space-y-6">
            {groups.map((g, gi) => (
              <div
                key={g.key}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-semibold truncate">
                      {g.survey}
                    </div>
                    <div className="text-xs sm:text-sm text-white/70">
                      {g.category} • {g.rows.length} response
                      {g.rows.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {g.rows.map((r, ri) => (
                    <div
                      key={r._id ?? `${g.key}::row::${ri}`} // ✅ unique key
                      className="resp-card rounded-xl border border-white/10 bg-white/8 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium truncate text-sm sm:text-base">
                            {r.name ?? "Anonymous"}
                          </div>
                          <div className="text-[11px] sm:text-xs text-white/70 truncate">
                            {r.email ?? "—"}
                          </div>
                        </div>
                        <span className="rounded-full bg-sky-400/15 px-3 py-0.5 text-[10px] sm:text-xs text-sky-200">
                          {r.answers?.length ?? 0} answers
                        </span>
                      </div>

                      {/* answers list */}
                      {Array.isArray(r.answers) && r.answers.length > 0 && (
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                          {r.answers.map((a, ai) => (
                            <li
                              key={`${r._id ?? ri}::a::${ai}`} // ✅ unique key
                              className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs sm:text-sm"
                            >
                              <div className="text-white/80">
                                {a.question}
                              </div>
                              <div className="text-white/60">
                                {Array.isArray(a.answer)
                                  ? a.answer.join(", ")
                                  : String(a.answer ?? "—")}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {!g.rows.length && (
                    <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-5 sm:p-6 text-center text-xs sm:text-sm text-white/70">
                      No responses yet for this survey.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {!groups.length && (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 sm:p-8 text-center text-xs sm:text-sm text-white/70">
                No responses collected yet.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
