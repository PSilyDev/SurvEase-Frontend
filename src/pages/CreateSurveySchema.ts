import { z } from "zod";

export const createSurveySchema = z.object({
  categoryName: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(40, "Category name must be at most 40 characters"),
  surveyName: z
    .string()
    .min(3, "Survey name must be at least 3 characters")
    .max(80, "Survey name must be at most 80 characters"),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateSurveyForm = z.infer<typeof createSurveySchema>;