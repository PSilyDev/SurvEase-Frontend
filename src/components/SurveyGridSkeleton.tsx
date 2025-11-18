import Skeleton from "./Skeleton";
export default function SurveyGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-11/12" />
          <Skeleton className="mt-2 h-4 w-8/12" />
          <Skeleton className="mt-4 h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
