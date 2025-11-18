import { useRef, useEffect, useState, useMemo } from "react";
import {
  useAutosaveSurvey,
  useSaveSurvey,
  useSurveys,
  usePublishSurvey,
} from "../api/surveys";
import { shallowEqual } from "../utils/shallowEqual";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { builderSchema, type BuilderSchema } from "../features/builder/schema";
import QuestionRow from "../features/builder/QuestionRow";
import toast from "react-hot-toast";
import { gsap } from "gsap";
import { ShareDialog } from "../features/surveys/ShareDialog";
import { useListMotion } from "../features/anim/useListMotion";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import Draggable from "../features/builder/Draggable";

export default function SurveyBuilder() {
  // ---------------- URL / prefill ----------------
  const [params] = useSearchParams();
  const initialCategory = params.get("category") || "General";
  const initialName = params.get("survey") || "";

  // fetch all (categories with surveys)
  const { data } = useSurveys({ enabled: true });

  // find matching survey by category + name
  const match = useMemo(() => {
    if (!Array.isArray(data)) return null;
    for (const cat of data) {
      if (cat.category_name !== initialCategory) continue;
      const found = (cat.surveys ?? []).find(
        (s: any) => s.survey_name === initialName
      );
      if (found) return found;
    }
    return null;
  }, [data, initialCategory, initialName]);

  // ---------------- form ----------------
  const navigate = useNavigate();
  const location = useLocation() as any;
  const prefill = location.state as Partial<BuilderSchema> | undefined;

  const autosave = useAutosaveSurvey();
  const save = useSaveSurvey();
  const publish = usePublishSurvey();

  const [shareLink, setShareLink] = useState<string | null>(null);
  const [saveState, setSaveState] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedRef = useRef<any>(null);
  const debounceRef = useRef<number | null>(null);
  type ShareMeta = { category: string; survey: string; shareId?: string };
  const [shareMeta, setShareMeta] = useState<ShareMeta | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BuilderSchema>({
    resolver: zodResolver(builderSchema),
    defaultValues: {
      categoryName: prefill?.categoryName || initialCategory || "General",
      surveyName: prefill?.surveyName || initialName || "",
      questions: [],
    },
    mode: "onBlur",
  });

  const { fields, append, remove, move, replace } = useFieldArray({
    control,
    name: "questions",
    keyName: "formId",
  });

  // when a matching survey exists, prefill the form + questions
  useEffect(() => {
    if (match) {
      setValue("categoryName", initialCategory);
      setValue("surveyName", initialName);
      const q = (match.questions ?? []).map((q: any, i: number) => ({
        id: q.id ?? nanoid(),
        text: q.text ?? "",
        type: q.type ?? "short_text",
        required: !!q.required,
        options: q.options ?? undefined,
        scaleMax: q.scaleMax ?? undefined,
      }));
      replace(q);
    }
  }, [match, initialCategory, initialName, replace, setValue]);

  // ---------------- animations ----------------
  const listRef = useRef<HTMLDivElement>(null);
  useListMotion(listRef, {
    selector: ":scope > .question-card",
    y: 12,
    duration: 0.24,
    stagger: 0.06,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      move(oldIndex, newIndex);
      requestAnimationFrame(() => {
        const moved = listRef.current?.children[newIndex] as HTMLElement | null;
        if (moved) {
          gsap.fromTo(
            moved,
            { backgroundColor: "#020617" },
            { backgroundColor: "transparent", duration: 0.6 }
          );
        }
      });
    }
  }

  // ---------------- publish ----------------
  async function handlePublish(category: string, survey: string) {
    if (!category || !survey) {
      toast.error("Please enter Category and Survey name first");
      return;
    }

    const { shareId } = await publish.mutateAsync({
      category_name: category,
      survey_name: survey,
    });

    const link = `${window.location.origin}/take/${encodeURIComponent(
      category
    )}/${encodeURIComponent(survey)}?share=${shareId}`;
    setShareLink(link);
    setShareMeta({ category, survey, shareId });
  }

  // ---------------- autosave ----------------
  const wCategory = watch("categoryName");
  const wSurvey = watch("surveyName");
  const wQs = watch("questions");

  useEffect(() => {
    const snapshot = {
      categoryName: wCategory,
      surveyName: wSurvey,
      questions: (wQs || []).map((q: any) => ({
        text: q.text,
        type: q.type,
        required: !!q.required,
        options: q.options ?? [],
        scaleMax: q.scaleMax ?? undefined,
      })),
    };

    if (lastSavedRef.current && shallowEqual(lastSavedRef.current, snapshot))
      return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        setSaveState("saving");
        await autosave.mutateAsync({
          categoryName: snapshot.categoryName,
          surveyName: snapshot.surveyName,
          questions: (wQs || []).map((q: any, i: number) => ({
            id: q.id || String(i + 1),
            text: q.text,
            type: q.type,
            required: !!q.required,
            options: q.options ?? [],
            scaleMax: q.scaleMax ?? undefined,
          })),
        });
        lastSavedRef.current = snapshot;
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 1200);
      } catch {
        setSaveState("error");
      }
    }, 800);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wCategory, wSurvey, wQs]);

  // ---------------- add / save / preview ----------------
  const onAddQuestion = (
    type: BuilderSchema["questions"][number]["type"]
  ) => {
    append({
      id: nanoid(),
      text: "",
      type,
      required: false,
      options:
        type === "single_choice" || type === "multiple_choice"
          ? ["Option 1", "Option 2"]
          : undefined,
      scaleMax: type === "rating" ? 5 : undefined,
    });
    requestAnimationFrame(() => {
      const el = listRef.current?.lastElementChild as HTMLElement | null;
      if (!el) return;
      gsap.fromTo(
        el,
        { y: 16, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }
      );
    });
  };

  async function onSubmit(values: BuilderSchema) {
    try {
      await save.mutateAsync(values);
      toast.success("Survey saved");
      navigate("/", { replace: true });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save survey");
    }
  }

  const qCount = (wQs || []).length;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl px-4 sm:px-0 py-6 sm:py-10 space-y-6"
    >
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Category + Survey name */}
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              Category
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              {...register("categoryName")}
            />
            {errors.categoryName && (
              <p className="mt-1 text-xs text-red-400">
                {errors.categoryName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-200">
              Survey name
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              {...register("surveyName")}
            />
            {errors.surveyName && (
              <p className="mt-1 text-xs text-red-400">
                {errors.surveyName.message}
              </p>
            )}
          </div>
        </div>

        {/* Add question buttons */}
        <div className="w-full lg:w-auto flex flex-wrap justify-start lg:justify-end gap-2">
          <button
            type="button"
            onClick={() => onAddQuestion("short_text")}
            className="flex-1 xs:flex-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            + Short text
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion("long_text")}
            className="flex-1 xs:flex-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            + Long text
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion("single_choice")}
            className="flex-1 xs:flex-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            + Single choice
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion("multiple_choice")}
            className="flex-1 xs:flex-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            + Multiple choice
          </button>
          <button
            type="button"
            onClick={() => onAddQuestion("rating")}
            className="flex-1 xs:flex-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            + Rating
          </button>
        </div>
      </header>

      {/* QUESTIONS LIST */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={fields.map((f) => f.id)}>
          <div ref={listRef} className="space-y-4">
            {fields.map((f, i) => (
              <Draggable key={f.id} id={f.id}>
                {(drag) => (
                  <div className="question-card rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
                    <QuestionRow
                      index={i}
                      control={control}
                      register={register}
                      remove={remove}
                      move={move}
                      errors={errors}
                      dragProps={drag}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {errors.questions?.message && (
              <p className="text-xs text-red-400">
                {String(errors.questions.message)}
              </p>
            )}
            {qCount === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
                Add your first question using the buttons above.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* PUBLISH */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={() =>
            handlePublish(watch("categoryName"), watch("surveyName"))
          }
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
        >
          Publish &amp; Share
        </button>
        {shareLink && shareMeta && (
          <ShareDialog
            link={shareLink}
            category={shareMeta.category}
            survey={shareMeta.survey}
            shareId={shareMeta.shareId}
            onClose={() => {
              setShareLink(null);
              setShareMeta(null);
            }}
          />
        )}
      </div>

      {/* FOOTER */}
      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-400">
        <div>
          {qCount} question{qCount !== 1 ? "s" : ""}
        </div>
        <div>
          {saveState === "saving" && <span>Saving…</span>}
          {saveState === "saved" && (
            <span className="text-emerald-400">Saved</span>
          )}
          {saveState === "error" && (
            <span className="text-red-400">Autosave failed</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isSubmitting || save.isPending}
            className="rounded-lg bg-sky-500 px-4 py-2 text-white shadow hover:bg-sky-600 disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save Survey"}
          </button>
          <button
            type="button"
            onClick={() => {
              (document.activeElement as HTMLElement | null)?.blur?.();
              navigate("/builder/preview", {
                state: { title: watch("surveyName"), questions: watch("questions") },
              });
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 hover:bg-slate-800"
          >
            Preview
          </button>
        </div>
      </footer>
    </form>
  );
}
