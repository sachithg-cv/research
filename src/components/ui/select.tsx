// src/components/ui/select.tsx
import React from "react";
import { cn } from "../../lib/utils";
import { SelectProps } from "../../types/renderer";

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], placeholder, value, onChange, loading, error, ...props }, ref) => {
    // Generate stable option keys
    const getOptionKey = (option: { value: string | number }) => 
      `option-${typeof option.value === 'string' ? option.value : String(option.value)}`;

    return (
      <div className="relative">
        <select
          ref={ref}
          value={value || ''}
          onChange={onChange}
          disabled={loading}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1",
            loading && "opacity-50 cursor-wait",
            error && "border-red-500",
            className
          )}
          {...props}
        >
          <option key="placeholder" value="">
            {loading ? "Loading..." : placeholder || "Select an option"}
          </option>
          {!loading && options.map((option) => (
            <option key={getOptionKey(option)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div className="text-red-500 text-sm mt-1">
            {typeof error === 'string' ? error : 'An error occurred'}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";