export const QUESTION_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "single_choice", label: "Multiple choice (single answer)" },
  { value: "multiple_choice", label: "Checkboxes (multiple answers)" },
  { value: "rating", label: "Rating scale" }
] as const;
