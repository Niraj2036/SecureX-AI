import React from "react";
import { Loader2 } from "lucide-react";

export interface V3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function V3Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: V3ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-xs gap-2",
    lg: "h-11 px-5 text-sm gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 active:bg-indigo-800",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-white shadow-sm focus:ring-slate-500",
    outline:
      "border border-border/80 bg-background hover:bg-muted text-foreground focus:ring-indigo-500",
    ghost:
      "hover:bg-muted text-foreground focus:ring-indigo-500",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 active:bg-rose-800",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
