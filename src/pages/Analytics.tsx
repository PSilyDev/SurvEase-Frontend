// src/pages/Analytics.tsx
import { useMemo, useRef, useLayoutEffect } from "react";
import { useSurveys } from "../api/surveys";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";

const slug = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "untitled";

const mergeCategories = (rows: any[] = []) => {
  const map = new Map<string, any>();
  for (const r of rows) {
    const key = r?.category_name ?? "Uncategorized";
    if (!map.has(key)) {
      map.set(key, {
        category_name: key,
        surveys: Array.isArray(r?.surveys) ? [...r.surveys] : [],
      });
    } else {
      const cur = map.get(key);
      if (Array.isArray(r?.surveys)) cur.surveys.push(...r.surveys);
    }
  }

  // dedupe
  for (const [_k, v] of map) {
    const seen = new Set<string>();
    v.surveys = (v.surveys || []).filter((s: any) => {
      const key = s?.survey_name ?? s?.title ?? "";
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return Array.from(map.values());
};

export default function Analytics() {
  const { token } = useAuth();
  const { data, isLoading, isError } = useSurveys({ enabled: !!token });

  const mergedCats = useMemo(
    () => mergeCategories(Array.isArray(data) ? data : []),
    [data]
  );

  const flatItems = useMemo(
    () =>
      mergedCats.flatMap((cat: any) =>
        (cat.surveys ?? []).map((s: any, idx: number) => ({
          id: s._id ?? `${cat.category_name}::${s.survey_name}::${idx}`,
          title: s.survey_name ?? s.title ?? "Untitled",
          category: cat.category_name,
          questions: s.questions?.length ?? 0,
          status: s.published ? "active" : "draft",
        }))
      ),
    [mergedCats]
  );

  const totals = useMemo(
    () => ({
      surveys: flatItems.length,
      questions: flatItems.reduce((acc, it) => acc + (it.questions || 0), 0),
      active: flatItems.filter((it) => it.status === "active").length,
      draft: flatItems.filter((it) => it.status !== "active").length,
    }),
    [flatItems]
  );

  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!listRef.current) return;
    const cards = listRef.current.querySelectorAll(".analytic-card");
    if (!cards.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }
      );
    }, listRef);
    return () => ctx.revert();
  }, [flatItems.length]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">

        {/* HEADER */}
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-xs sm:text-sm text-white/70">
            Overview of your surveys.
          </p>
        </header>

        {/* SUMMARY */}
        <section className="grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total surveys", value: totals.surveys },
            { label: "Total questions", value: totals.questions },
            { label: "Active", value: totals.active },
            { label: "Draft", value: totals.draft },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 shadow-[0_0_24px_rgba(91,124,255,.15)]"
            >
              <div className="text-xl sm:text-3xl font-extrabold">{m.value}</div>
              <div className="text-[11px] sm:text-sm text-white/80 mt-1">
                {m.label}
              </div>
            </div>
          ))}
        </section>

        {/* CATEGORY GROUPS */}
        {isLoading ? (
          <div className="text-white/80 text-sm">Loading…</div>
        ) : isError ? (
          <div className="text-red-300 text-sm">Failed to load analytics.</div>
        ) : (
          <section ref={listRef} className="space-y-5 sm:space-y-6">
            {mergedCats.map((cat: any) => {
              const surveys = cat.surveys ?? [];
              const totalQs = surveys.reduce(
                (acc: number, s: any) => acc + (s.questions?.length || 0),
                0
              );

              return (
                <div
                  key={slug(cat.category_name)}
                  className="rounded-2xl border border-white/10 bg-[#05070b]/70 p-4 sm:p-6 shadow-[0_0_24px_rgba(91,124,255,.12)]"
                >
                  <div className="mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold">{cat.category_name}</h2>
                    <p className="text-[11px] sm:text-xs text-white/60">
                      {surveys.length} surveys • {totalQs} questions
                    </p>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {surveys.map((s: any, idx: number) => {
                      const qCount = s.questions?.length ?? 0;
                      const status = s.published ? "active" : "draft";

                      return (
                        <div
                          key={`${slug(cat.category_name)}::${slug(s.survey_name)}::${idx}`}
                          className="analytic-card rounded-2xl border border-white/10 bg-white/8 p-3 sm:p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm sm:text-base font-semibold">
                                {s.survey_name ?? s.title ?? "Untitled"}
                              </div>
                              <div className="text-[10px] sm:text-xs text-white/70">
                                {cat.category_name} • {qCount} questions
                              </div>
                            </div>

                            <span
                              className={
                                "rounded-full px-2 py-0.5 text-[10px] sm:text-xs " +
                                (status === "active"
                                  ? "bg-emerald-400/15 text-emerald-200"
                                  : "bg-amber-400/15 text-amber-200")
                              }
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {!surveys.length && (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 sm:p-6 text-center text-xs text-white/70">
                        No surveys in this category.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
