import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

type Q = {
  id: string;
  text: string;
  type: "short_text" | "long_text" | "single_choice" | "multiple_choice" | "rating";
  options?: string[];
  required: boolean;
  scaleMax?: number;
};

function buildSchema(questions: Q[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const q of questions) {
    let base: z.ZodTypeAny;
    switch (q.type) {
      case "short_text":
      case "long_text":
        base = z.string().trim();
        break;
      case "single_choice":
        base = z.string();
        break;
      case "multiple_choice":
        base = z.array(z.string()).min(q.required ? 1 : 0);
        break;
      case "rating":
        base = z.number().int().min(1).max(q.scaleMax ?? 10);
        break;
      default:
        base = z.any();
    }
    shape[q.id] = q.required ? base.refine(v => !(v === "" || v == null), "Required") : base.optional();
  }
  return z.object(shape);
}

export default function PreviewRunner({
  title,
  questions
}: { title: string; questions: Q[] }) {
  const schema = buildSchema(questions);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  function onSubmit(values: any) {
    console.log("Preview submit", values);
    toast.success("Preview submitted (not saved)");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold">{title} — Preview</h2>
      {questions.map((q) => (
        <div key={q.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block font-medium">{q.text}{q.required && <span className="text-red-500">*</span>}</label>

          {q.type === "short_text" && (
            <input className="mt-2 w-full rounded-lg border px-3 py-2 focus:ring-4 focus:ring-blue-200" {...register(q.id)} />
          )}

          {q.type === "long_text" && (
            <textarea rows={4} className="mt-2 w-full rounded-lg border px-3 py-2 focus:ring-4 focus:ring-blue-200" {...register(q.id)} />
          )}

          {q.type === "single_choice" && (
            <div className="mt-2 space-y-2">
              {q.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input type="radio" value={opt} {...register(q.id)} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "multiple_choice" && (
            <div className="mt-2 space-y-2">
              {q.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={e => {
                      const current = watch(q.id) || [];
                      setValue(q.id, e.target.checked ? [...current, opt] : current.filter((v: string) => v !== opt), { shouldValidate: true });
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "rating" && (
            <input type="number" min={1} max={q.scaleMax ?? 10} className="mt-2 w-28 rounded-lg border px-3 py-2" {...register(q.id, { valueAsNumber: true })} />
          )}

          {errors[q.id] && <p className="mt-1 text-xs text-red-600">{(errors as any)[q.id]?.message as string}</p>}
        </div>
      ))}

      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">Submit (Preview)</button>
    </form>
  );
}
