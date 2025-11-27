"use client";

import React, { useId } from "react";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  multiple?: boolean;
}

export function Select({ label, options, id, multiple = false, className = "", ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? `select-${autoId}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        multiple={multiple}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...rest}
      >
        {!multiple && <option value="">Select...</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
