import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { useState } from "react";

type SrvQ = { id: number; text: string; type: string; options?: string[]; };
type Props = { categoryName: string; surveyName: string; questions: SrvQ[]; };

function schemaFrom(questions: SrvQ[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const q of questions) {
    switch (q.type) {
      case "short_text":
      case "long_text":
        shape[q.id] = z.string().trim().optional();
        break;
      case "single_choice":
        shape[q.id] = z.string().optional();
        break;
      case "multiple_choice":
        shape[q.id] = z.array(z.string()).optional();
        break;
      case "rating":
        shape[q.id] = z.number().int().min(1).max(10).optional();
        break;
      default:
        shape[q.id] = z.any().optional();
    }
  }
  return z.object(shape);
}

export default function PublicRunner({ categoryName, surveyName, questions }: Props) {
  const [meta, setMeta] = useState({ name: "", email: "" });

  const schema = schemaFrom(questions);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  async function onSubmit(values: any) {
    try {
      // map answers to your backend shape
      const answers = questions.map(q => {
        const v = values[q.id];
        // ensure array for multiple_choice, scalar otherwise
        const answer = Array.isArray(v) ? v : (v !== undefined ? [v] : []);
        return { question: q.text, answer };
      });

      const payload = {
        id: crypto.randomUUID(),
        name: meta.name,
        email: meta.email,
        category_name: categoryName,
        survey_name: surveyName,
        answers
      };

      await api.post("/response-api/response", payload);
      toast.success("Thanks! Your response was recorded.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* respondent details (optional) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Your name</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2" value={meta.name} onChange={e=>setMeta(m=>({...m,name:e.target.value}))}/>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" className="mt-1 w-full rounded-lg border px-3 py-2" value={meta.email} onChange={e=>setMeta(m=>({...m,email:e.target.value}))}/>
          </div>
        </div>
      </div>

      {questions.map((q) => (
        <div key={q.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <label className="block font-medium">{q.text}</label>

          {q.type === "short_text" && (
            <input className="mt-2 w-full rounded-lg border px-3 py-2" {...register(String(q.id))} />
          )}

          {q.type === "long_text" && (
            <textarea rows={4} className="mt-2 w-full rounded-lg border px-3 py-2" {...register(String(q.id))} />
          )}

          {q.type === "single_choice" && (
            <div className="mt-2 space-y-2">
              {q.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2">
                  <input type="radio" value={opt} {...register(String(q.id))} />
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
                    onChange={(e) => {
                      const current = watch(String(q.id)) || [];
                      setValue(String(q.id), e.target.checked ? [...current, opt] : current.filter((v: string) => v !== opt));
                    }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === "rating" && (
            <input type="number" min={1} max={10} className="mt-2 w-28 rounded-lg border px-3 py-2" {...register(String(q.id), { valueAsNumber: true })} />
          )}

          {errors[q.id] && <p className="mt-1 text-xs text-red-600">{(errors as any)[q.id]?.message as string}</p>}
        </div>
      ))}

      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
        Submit
      </button>
    </form>
  );
}
