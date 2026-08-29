import React from "react";

export interface V3InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const V3Input = React.forwardRef<HTMLInputElement, V3InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="text-xs font-semibold text-foreground block">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-9 rounded-lg border border-border/80 bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
              icon ? "pl-9" : ""
            } ${error ? "border-rose-500 focus:ring-rose-500" : ""} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  }
);

V3Input.displayName = "V3Input";
