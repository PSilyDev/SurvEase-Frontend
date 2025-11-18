import { useRef, useEffect, useLayoutEffect, useMemo, useState } from "react";
import SurveyCard from "../components/SurveyCard";
import { useSurveys } from "../api/surveys";
import SurveyGridSkeleton from "../components/SurveyGridSkeleton";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  // ensure dedup inside surveys by survey_name
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

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // fetch only when logged in
  const { data, isLoading, isError, error, refetch } = useSurveys({
    enabled: !!token,
  });

  const mergedCats = useMemo(
    () => mergeCategories(Array.isArray(data) ? data : []),
    [data]
  );

  const categories = useMemo(
    () => mergedCats.map((c: any) => c.category_name),
    [mergedCats]
  );

  const [catFilter, setCatFilter] = useState<string>("__ALL__");

  const visibleCats = useMemo(() => {
    if (catFilter === "__ALL__") return mergedCats;
    return mergedCats.filter((c: any) => c.category_name === catFilter);
  }, [mergedCats, catFilter]);

  const qc = useQueryClient();

  const deleteSurvey = useMutation({
    mutationFn: async (body: { category_name: string; survey_name: string }) => {
      const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await fetch(`${base}/survey-api/survey`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = "Failed to delete";
        try {
          msg = (await res.json()).message || msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["surveys"] });
      const prev = qc.getQueryData<any[]>(["surveys"]);
      if (Array.isArray(prev)) {
        const next = mergeCategories(prev)
          .map((c) =>
            c.category_name !== vars.category_name
              ? c
              : {
                  ...c,
                  surveys: (c.surveys || []).filter(
                    (s: any) => s.survey_name !== vars.survey_name
                  ),
                }
          )
          .filter((c) => (c.surveys?.length ?? 0) > 0);
        qc.setQueryData(["surveys"], next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["surveys"], ctx.prev);
      toast.error("Failed to delete survey");
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["surveys"] });
    },
  });

  // refs for animations
  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // page/hero enter
  useLayoutEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        ".survey-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.1,
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!isError) return;
    const msg =
      (error as any)?.response?.data?.error ||
      (error as Error)?.message ||
      "Failed to load surveys";
    toast.error(msg);
  }, [isError, error]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10" ref={pageRef}>
      {/* DARK GSAP-STYLE HERO */}
      <section className="hero relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d10] p-6 sm:p-10 md:p-16 text-white shadow-[0_0_24px_rgba(91,124,255,.15),0_0_48px_rgba(0,255,204,.05)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#1e1e28] via-[#0b0d10] to-transparent" />
        <h1 className="relative text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Animate your{" "}
          <span className="bg-gradient-to-r from-[#00ffcc] via-[#5b7cff] to-[#9d5eff] bg-clip-text text-transparent">
            surveys
          </span>
          .
        </h1>
        <p className="relative mt-3 sm:mt-4 max-w-2xl text-sm sm:text-[16px] text-white/70">
          Craft, launch, and analyze surveys in an expressive, animated environment
          powered by React + GSAP.
        </p>
        <div className="relative mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={() => navigate(token ? "/create" : "/signup")}
            className="rounded-2xl cursor-pointer bg-white px-5 sm:px-6 py-2.5 font-semibold text-[#0b0d10] shadow-[0_0_24px_rgba(91,124,255,.15)] hover:scale-105 transition-transform"
          >
            {token ? "New Survey" : "Get Started — Free"}
          </button>
          <Link
            to="/analytics"
            className="rounded-2xl border border-white/30 bg-white/10 px-5 sm:px-6 py-2.5 text-white hover:bg-white/20 transition"
          >
            View Analytics
          </Link>
        </div>
      </section>

      {/* Only show list if logged in */}
      {token && (
        <>
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">Your Surveys</h2>
            </div>
          </header>

          {/* Filter row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="text-sm">Category</label>
            <select
              className="rounded-xl border border-white/20 bg-[#111418] text-white px-3 py-2 
                        hover:bg-[#1a1d22] transition outline-none cursor-pointer"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option className="bg-[#111418] text-white" value="__ALL__">All</option>
              {categories.map((c) => (
                <option
                  key={c}
                  value={c}
                  className="bg-[#111418] text-white"
                >
                  {c}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <SurveyGridSkeleton />
          ) : (
            <div ref={gridRef} className="space-y-6 sm:space-y-8">
              {visibleCats.map((cat: any) => (
                <section
                  key={slug(cat.category_name)}
                  className="cat-section rounded-2xl border border-white/10 bg-[#0c0f14]/60 backdrop-blur-sm p-4 sm:p-6 shadow-[0_0_24px_rgba(91,124,255,.08)]"
                >
                  <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">
                        {cat.category_name}
                      </h3>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-xs text-white/75">
                        {(cat.surveys?.length ?? 0)} surveys
                      </span>
                    </div>
                    {cat.surveys?.length === 0 && (
                      <span className="text-xs text-white/50">Empty</span>
                    )}
                  </div>

                  <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {(cat.surveys ?? []).map((s: any, idx: number) => (
                      <div
                        key={`${slug(cat.category_name)}::${slug(
                          s.survey_name
                        )}::${idx}`}
                        className="group relative rounded-2xl border border-black/10 bg-white/[0.03] p-4 sm:p-5 shadow-[0_0_24px_rgba(91,124,255,.12)]"
                      >
                        {/* card body click -> open builder */}
                        <button
                          className="absolute inset-0"
                          onClick={() =>
                            navigate(
                              `/builder?category=${encodeURIComponent(
                                cat.category_name
                              )}&survey=${encodeURIComponent(s.survey_name)}`
                            )
                          }
                          aria-label="Open survey"
                        />
                        <SurveyCard
                          title={s.survey_name || s.title || s.name}
                          description={s.description || ""}
                          status={s.published ? "active" : "draft"}
                          questionsCount={s.questions?.length ?? 0}
                        />
                        {/* delete button (stops card navigation) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            deleteSurvey.mutate({
                              category_name: cat.category_name,
                              survey_name: s.survey_name,
                            });
                          }}
                          className="relative z-10 mt-3 inline-flex justify-center sm:justify-start rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 w-full sm:w-auto"
                        >
                          Delete
                        </button>
                      </div>
                    ))}

                    {!cat.surveys?.length && (
                      <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 sm:p-10 text-center text-white/70">
                        No surveys in this category.
                      </div>
                    )}
                  </div>
                </section>
              ))}

              {!visibleCats.length && (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 sm:p-10 text-center text-white/70">
                  No categories to show.
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition"
            >
              Refresh
            </button>
          </div>
        </>
      )}
    </div>
  );
}
