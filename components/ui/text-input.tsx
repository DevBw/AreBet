import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextInput({ label, hint, error, id, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={inputId} className="field">
      <span className="field-label">{label}</span>
      <input id={inputId} {...props} />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </label>
  );
}
