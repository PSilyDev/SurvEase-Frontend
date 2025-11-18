import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { useState } from "react";

type SrvQ = { id: number; text: string; type: string; options?: string[] };
type Props = {
  categoryName: string;
  surveyName: string;
  questions: SrvQ[];
};

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

export default function PublicRunner({
  categoryName,
  surveyName,
  questions,
}: Props) {
  const [meta, setMeta] = useState({ name: "", email: "" });

  const schema = schemaFrom(questions);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: any) {
    try {
      const answers = questions.map((q) => {
        const v = values[q.id];
        const answer = Array.isArray(v) ? v : v !== undefined ? [v] : [];
        return { question: q.text, answer };
      });

      const payload = {
        id: crypto.randomUUID(),
        name: meta.name,
        email: meta.email,
        category_name: categoryName,
        survey_name: surveyName,
        answers,
      };

      await api.post("/response-api/response", payload);
      toast.success("Thanks! Your response was recorded.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit");
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-3xl rounded-2xl bg-slate-800/90 p-6 shadow-xl ring-1 ring-slate-700/70">
        <h1 className="text-2xl font-semibold">{surveyName}</h1>
        <p className="mb-6 text-sm text-slate-400">
          Category: <span className="font-medium">{categoryName}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* respondent details (optional) */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Your name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  value={meta.name}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  value={meta.email}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, email: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-sm"
            >
              <label className="block text-sm font-medium">{q.text}</label>

              {q.type === "short_text" && (
                <input
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  {...register(String(q.id))}
                />
              )}

              {q.type === "long_text" && (
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  {...register(String(q.id))}
                />
              )}

              {q.type === "single_choice" && (
                <div className="mt-3 space-y-2 text-sm">
                  {q.options?.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-slate-100"
                    >
                      <input
                        type="radio"
                        value={opt}
                        {...register(String(q.id))}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "multiple_choice" && (
                <div className="mt-3 space-y-2 text-sm">
                  {q.options?.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-slate-100"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const current = watch(String(q.id)) || [];
                          setValue(
                            String(q.id),
                            e.target.checked
                              ? [...current, opt]
                              : current.filter((v: string) => v !== opt)
                          );
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "rating" && (
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="mt-2 w-28 rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
                  {...register(String(q.id), { valueAsNumber: true })}
                />
              )}

              {errors[q.id] && (
                <p className="mt-1 text-xs text-red-400">
                  {(errors as any)[q.id]?.message as string}
                </p>
              )}
            </div>
          ))}

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
