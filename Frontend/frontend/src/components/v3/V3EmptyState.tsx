import React from "react";
import { FolderOpen } from "lucide-react";

interface V3EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function V3EmptyState({
  icon = <FolderOpen className="h-8 w-8 text-muted-foreground/50" />,
  title,
  description,
  children,
}: V3EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
      <div className="p-3 bg-muted/40 rounded-full border border-border/50">{icon}</div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
