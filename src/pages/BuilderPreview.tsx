// src/pages/BuilderPreview.tsx
import { useLocation, useNavigate } from "react-router-dom";
import PreviewRunner from "../features/runner/PreviewRunner";

export default function BuilderPreview() {
  const nav = useNavigate();
  const { state } = useLocation() as any;
  if (!state?.questions?.length) {
    return (
      <div className="space-y-4">
        <p>No questions to preview.</p>
        <button onClick={() => nav(-1)} className="rounded border px-3 py-1.5">Back</button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl space-y-6">
      <PreviewRunner title={state.title || "Untitled Survey"} questions={state.questions} />
      <button onClick={() => nav(-1)} className="rounded border px-3 py-1.5">Back to Builder</button>
    </div>
  );
}
