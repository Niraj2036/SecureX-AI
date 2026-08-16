import React from "react";

export interface V3TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface V3TabsProps {
  tabs: V3TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function V3Tabs({ tabs, activeTab, onChange, className = "" }: V3TabsProps) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-muted/50 border border-border/70 rounded-xl ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
