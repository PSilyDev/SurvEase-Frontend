import { z } from "zod";

export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "Question must be at least 3 characters"),
  type: z.enum(["short_text", "long_text", "single_choice", "multiple_choice", "rating"]),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)).optional(),
  scaleMax: z.number().int().min(3).max(10).optional()
}).refine(q => {
  if (q.type === "single_choice" || q.type === "multiple_choice") {
    return Array.isArray(q.options) && q.options.length >= 2;
  }
  return true;
}, { message: "Provide at least 2 options", path: ["options"] })
.refine(q => {
  if (q.type === "rating") return !!q.scaleMax;
  return true;
}, { message: "Provide a scale maximum (e.g. 5 or 10)", path: ["scaleMax"] });

export const builderSchema = z.object({
  categoryName: z.string().min(2),
  surveyName: z.string().min(3),
  questions: z.array(questionSchema).min(1, "Add at least one question")
});

// ✅ Add this line
export type BuilderSchema = z.infer<typeof builderSchema>;
console.log("exports", { builderSchema, BuilderSchema: {} });

