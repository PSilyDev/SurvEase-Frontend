import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import toast from "react-hot-toast";
import PublicRunner from "../features/runner/PublicRunner";

async function fetchSurvey(category: string, survey: string) {
  const res = await api.get("/survey-api/public");
  const cats = res.data?.payload ?? [];
  const cat = cats.find((c: any) => c.category_name === category);
  const s = cat?.surveys?.find((x: any) => x.survey_name === survey);
  if (!s) throw new Error("Survey not found");
  return { category_name: category, survey: s };
}

export default function TakeSurvey() {
  const { category, survey } = useParams();
  const q = useQuery({
    queryKey: ["publicSurvey", category, survey],
    queryFn: () => fetchSurvey(category!, survey!),
    enabled: Boolean(category && survey)
  });

  if (q.isLoading) return <div>Loading…</div>;
  if (q.isError) {
    toast.error((q.error as Error).message);
    return <div>Failed to load survey.</div>;
  }

  const data = q.data!;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">{data.survey.survey_name}</h1>
      <PublicRunner
        categoryName={data.category_name}
        surveyName={data.survey.survey_name}
        questions={data.survey.questions ?? []}
      />
    </div>
  );
}
