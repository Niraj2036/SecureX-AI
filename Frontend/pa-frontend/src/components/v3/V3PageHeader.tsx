import React from "react";
import { Badge } from "@/components/ui/badge";

interface V3PageHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function V3PageHeader({
  title,
  description,
  badgeText,
  badgeIcon,
  children,
}: V3PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 v3-card p-6 bg-gradient-to-r from-background via-muted/30 to-background border-border/80">
      <div className="space-y-1">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {badgeText && (
            <Badge variant="secondary" className="px-2.5 py-0.5 font-semibold text-xs border border-border/60">
              {badgeIcon && <span className="mr-1 inline-flex items-center">{badgeIcon}</span>}
              {badgeText}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>

      {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
    </div>
  );
}
