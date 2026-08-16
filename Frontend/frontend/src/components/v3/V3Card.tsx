import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface V3CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function V3Card({ children, className, glass, ...props }: V3CardProps) {
  return (
    <Card
      className={cn(
        "v3-card border-border/70 shadow-sm transition-all duration-200 hover:border-border/90",
        glass && "v3-glass",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

interface V3StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: string;
}

export function V3StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-primary/10 text-primary",
  trend,
}: V3StatCardProps) {
  return (
    <Card className="v3-card p-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm", iconBg)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-2xl font-extrabold text-foreground tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 leading-tight">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
