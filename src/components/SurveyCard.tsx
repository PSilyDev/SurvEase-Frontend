// src/components/SurveyCard.tsx
type SurveyCardProps = {
  title: string;
  description?: string;
  status?: "active" | "draft" | string;
  questionsCount?: number;
};

export default function SurveyCard({
  title,
  description,
  status,
  questionsCount = 0,
}: SurveyCardProps) {
  const label =
    typeof status === "string"
      ? status
      : status === "active"
      ? "active"
      : "draft";

  const isActive = label === "active";

  return (
    <div className="flex flex-col gap-3">
      {/* top row: title + status pill */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-semibold text-slate-200">
            {title || "Untitled survey"}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {status && (
          <span
            className={
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium " +
              (isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700")
            }
          >
            {label}
          </span>
        )}
      </div>

      {/* bottom row: meta + Open CTA (visual only – click handled by parent) */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
        <span>
          {questionsCount} question{questionsCount === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-blue-600">
          Open <span aria-hidden>→</span>
        </span>
      </div>
    </div>
  );
}
