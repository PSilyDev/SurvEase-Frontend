import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";

export type ResponseDoc = {
  _id: string;
  id: string;
  name?: string;
  email?: string;
  category_name: string;
  survey_name: string;
  answers: { question: string; answer: (string|number)[] }[];
  createdAt?: string;
};

export function useResponses() {
  return useQuery({
    queryKey: ["responses"],
    queryFn: async (): Promise<ResponseDoc[]> => {
      const r = await api.get("/response-api/responses");
      return r.data?.payload ?? [];
    }
  });
}

export function useDeleteResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string) => {
      const r = await api.delete(`/response-api/response/${_id}`);
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["responses"] })
  });
}
