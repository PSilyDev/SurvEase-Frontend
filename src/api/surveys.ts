// src/api/surveys.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import { nanoid } from "nanoid";
import axios from "axios";

export function useResponses(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["responses"],
    queryFn: async () => {
      const res = await api.get("/response-api/responses");
      // expect { message, payload: Response[] }
      return res.data?.payload ?? [];
    },
    staleTime: 60_000,
    enabled: opts?.enabled ?? true,
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { categoryName: string; surveyName: string }) => {
      // adjust endpoint/path to match your backend
      return api.post("/survey-api/createSurvey", {
        category_name: body.categoryName,
        survey_name: body.surveyName,
      });
    },
    onSuccess: async () => {
      // ensure Home list updates
      await qc.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
}

export function useSurveys(opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      const r = await api.get("/survey-api/public"); // returns categories with surveys
      return r.data?.payload ?? [];
    },
    enabled: opts?.enabled !== false,
    staleTime: 0,                     // <- ensure fresh after invalidation
    refetchOnWindowFocus: false,
  });
}

export function useSaveSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      categoryName: string;
      surveyName: string;
      questions: any[];
    }) => {
      // call your replace/update endpoint
      // map body -> server shape
      return api.put("/survey-api/replaceSurvey", {
        category_name: body.categoryName,
        surveys: [
          {
            survey_name: body.surveyName,
            questions: body.questions,
          },
        ],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["surveys"] }); // 👈 important
    },
  });
}

export function useAutosaveSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      categoryName: string;
      surveyName: string;
      questions: any[];
    }) => {
      // same endpoint as save, or a lighter autosave endpoint
      return api.put("/survey-api/replaceSurvey", {
        category_name: body.categoryName,
        surveys: [
          {
            survey_name: body.surveyName,
            questions: body.questions,
          },
        ],
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["surveys"] }); // 👈 keep cache in sync
    },
  });
}

export function usePublishSurvey() {
  return useMutation({
    mutationFn: async (_: { category_name: string; survey_name: string }) => {
      // temp client-only share id; replace with api.post when backend is ready
      return { shareId: crypto.randomUUID().slice(0, 10) };
    },
  });
}