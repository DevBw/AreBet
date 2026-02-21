import type { SelectHTMLAttributes } from "react";

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
};

export function SelectField({ label, options, id, ...props }: SelectFieldProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={selectId} className="field">
      <span className="field-label">{label}</span>
      <select id={selectId} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
