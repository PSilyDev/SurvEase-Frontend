import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import type {
  UseFormRegister,
  Control,
  FieldErrors,
} from "react-hook-form";
import type { BuilderSchema } from "./schema";
import { QUESTION_TYPES } from "./constants";

type Props = {
  index: number;
  control: Control<BuilderSchema>;
  register: UseFormRegister<BuilderSchema>;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  errors: FieldErrors<BuilderSchema>;
  dragProps?: {
    setNodeRef: (node: HTMLElement | null) => void;
    attributes: Record<string, any>;
    listeners: Record<string, any>;
    style: React.CSSProperties;
  };
};

export default function QuestionRow({
  index,
  control,
  register,
  remove,
  move,
  errors,
  dragProps,
}: Props) {
  const err = (errors?.questions as any)?.[index] ?? {};
  const typeName = `questions.${index}.type` as const;

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${index}.options` as const,
  });

  return (
    <div
      ref={dragProps?.setNodeRef}
      style={dragProps?.style}
      className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100 shadow-sm"
    >
      {/* mobile: stack; desktop: row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* left section: drag + content */}
        <div className="flex items-start gap-3 sm:flex-1 min-w-0">
          {/* drag handle */}
          <button
            type="button"
            className="mt-1 cursor-grab select-none rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs sm:text-sm text-slate-400 hover:bg-slate-800 active:cursor-grabbing"
            aria-label="Drag to reorder"
            {...(dragProps?.attributes || {})}
            {...(dragProps?.listeners || {})}
          >
            ⋮⋮
          </button>

          {/* main content */}
          <div className="flex-1 space-y-2 min-w-0">
            <input
              placeholder={`Question ${index + 1}`}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              {...register(`questions.${index}.text` as const)}
            />
            {err?.text?.message && (
              <p className="text-xs text-red-400">
                {err.text.message as string}
              </p>
            )}

            {/* TYPE + REQUIRED ROW */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <select
                className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                {...register(typeName)}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                <input
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500/40"
                  {...register(`questions.${index}.required` as const)}
                />
                Required
              </label>
            </div>

            {/* Choice / rating specific controls */}
            <Controller
              control={control}
              name={typeName}
              render={({ field }) => {
                const isChoice =
                  field.value === "single_choice" ||
                  field.value === "multiple_choice";
                const isRating = field.value === "rating";

                return (
                  <>
                    {isChoice && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm font-medium text-slate-100">
                            Options
                          </div>
                          <button
                            type="button"
                            onClick={() => appendOption("")}
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
                          >
                            + Add option
                          </button>
                        </div>

                        {optionFields.length === 0 && (
                          <p className="text-xs text-slate-400">
                            Add at least two options.
                          </p>
                        )}

                        <div className="space-y-2">
                          {optionFields.map((opt, oi) => (
                            <div
                              key={opt.id}
                              className="flex flex-col gap-2 sm:flex-row sm:items-center"
                            >
                              <input
                                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                placeholder={`Option ${oi + 1}`}
                                {...register(
                                  `questions.${index}.options.${oi}` as const
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(oi)}
                                className="self-start rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs sm:text-sm text-red-300 hover:bg-red-500/20"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>

                        {err?.options?.message && (
                          <p className="text-xs text-red-400">
                            {err.options.message as string}
                          </p>
                        )}
                      </div>
                    )}

                    {isRating && (
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-slate-100">
                          Max rating (3–10)
                        </label>
                        <input
                          type="number"
                          min={3}
                          max={10}
                          className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          {...register(
                            `questions.${index}.scaleMax` as const,
                            { valueAsNumber: true }
                          )}
                        />
                        {err?.scaleMax?.message && (
                          <p className="text-xs text-red-400">
                            {err.scaleMax.message as string}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                );
              }}
            />
          </div>
        </div>

        {/* right/bottom: move + delete controls */}
        <div className="mt-1 flex flex-wrap justify-end gap-2 sm:mt-0 sm:flex-col sm:items-stretch sm:justify-start">
          <button
            type="button"
            onClick={() => move(index, Math.max(0, index - 1))}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, index + 1)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-xs sm:text-sm text-slate-100 hover:bg-slate-800"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(index)}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs sm:text-sm text-red-300 hover:bg-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
