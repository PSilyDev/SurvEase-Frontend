import { ReactNode } from "react";

type Props = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
};

export default function FormField({ label, htmlFor, children, hint, error, required }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
