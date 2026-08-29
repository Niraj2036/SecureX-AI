import React from "react";
import { ChevronDown } from "lucide-react";

export interface V3SelectOption {
  value: string;
  label: string;
}

export interface V3SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: V3SelectOption[];
  error?: string;
}

export const V3Select = React.forwardRef<HTMLSelectElement, V3SelectProps>(
  ({ label, options, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="text-xs font-semibold text-foreground block">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            className={`w-full h-9 rounded-lg border border-border/80 bg-background px-3 pr-8 text-xs text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
              error ? "border-rose-500 focus:ring-rose-500" : ""
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  }
);

V3Select.displayName = "V3Select";
