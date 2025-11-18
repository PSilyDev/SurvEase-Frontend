import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSurveySchema, type CreateSurveyForm } from "./CreateSurveySchema";
import FormField from "../components/form/FormField";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSaveSurvey } from "../api/surveys"; // 👈 use the upsert/save hook

export default function CreateSurvey() {
  const navigate = useNavigate();
  const saveSurvey = useSaveSurvey();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateSurveyForm>({
    resolver: zodResolver(createSurveySchema),
    defaultValues: {
      categoryName: "General",
      surveyName: "",
      description: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(values: CreateSurveyForm) {
    try {
      // Upsert a new survey with empty questions
      await saveSurvey.mutateAsync({
        categoryName: values.categoryName,
        surveyName: values.surveyName,
        questions: [], // start empty; builder will add/edit
      });

      toast.success("Survey created");
      // optional: keep the chosen category for convenience
      reset({ categoryName: values.categoryName, surveyName: "", description: "" });

      // Open the builder with URL params so it can prefill properly
      navigate(
        `/builder?category=${encodeURIComponent(values.categoryName)}&survey=${encodeURIComponent(values.surveyName)}`
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to create survey";
      toast.error(msg);
    }
  }

  const name = watch("surveyName");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold">Create a New Survey</h1>

      <FormField
        label="Category"
        htmlFor="categoryName"
        required
        hint="Pick an existing category or create a new one."
        error={errors.categoryName?.message}
      >
        <input
          id="categoryName"
          className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-4 focus:ring-blue-200"
          placeholder="e.g., General"
          {...register("categoryName")}
        />
      </FormField>

      <FormField
        label="Survey Name"
        htmlFor="surveyName"
        required
        hint="Visible to respondents."
        error={errors.surveyName?.message}
      >
        <input
          id="surveyName"
          className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-4 focus:ring-blue-200"
          placeholder="e.g., Customer Satisfaction Q4"
          {...register("surveyName")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        hint="Optional; keep it short."
        error={errors.description?.message}
      >
        <textarea
          id="description"
          rows={4}
          className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-4 focus:ring-blue-200"
          placeholder="Brief description for admins"
          {...register("description")}
        />
      </FormField>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{name?.length ? `${name.length}/80` : ""}</div>
        <button
          disabled={isSubmitting || saveSurvey.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:opacity-60"
        >
          {saveSurvey.isPending ? "Creating…" : "Create Survey"}
        </button>
      </div>
    </form>
  );
}
