export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "rating";

export type Question = {
  id: string;        // local id; server can replace
  text: string;
  type: QuestionType;
  options?: string[]; // for single/multiple choice
  required: boolean;
  scaleMax?: number;  // for rating, e.g., 5 or 10
};

export type BuilderForm = {
  categoryName: string;
  surveyName: string;
  questions: Question[];
};
