export type SurveyStatus = "draft" | "active" | "closed";

export type Survey = {
  id: string;
  title: string;
  description?: string;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateSurveyInput = {
  title: string;
  description?: string;
};
