"use client";
import { useState } from "react";
import React from "react";
import ObjectivePermissions from "@/components/Permissions/ObjectivePermissions";
import CheckInPermissions from "@/components/Permissions/CheckInPermissions";
import OneOnOnePermissions from "@/components/Permissions/OneOnOnePerformance";
import PerformancePermissions from "@/components/Permissions/PerformancePermissions";
import { CalendarCheck, LineChart, Target, UserRound, ShieldCheck } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";

const tabs = [
  { id: "Objective", label: "Objective", icon: Target },
  { id: "CheckIn", label: "Check-In", icon: CalendarCheck },
  { id: "OneOnOne", label: "One-on-One", icon: UserRound },
  { id: "Performance", label: "Performance", icon: LineChart },
];

const Page = () => {
  const [activeTab, setActiveTab] = useState("Objective");

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Role Profiles & Permissions"
        description="Configure permission profiles and access policies for each organizational role."
        badgeText="Access Control"
        badgeIcon={<ShieldCheck className="h-3 w-3 text-indigo-600" />}
      />

      <div className="flex gap-6">
        {/* Left Sidebar Nav */}
        <V3Card className="w-56 flex-shrink-0 p-3 h-fit">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Permission Categories</p>
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === id
                    ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${activeTab === id ? "text-indigo-600" : ""}`} />
                {label}
              </button>
            ))}
          </nav>
        </V3Card>

        {/* Main Content */}
        <V3Card className="flex-1 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">
                {tabs.find((t) => t.id === activeTab)?.label} Permissions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure access rights for the {tabs.find((t) => t.id === activeTab)?.label?.toLowerCase()} module
              </p>
            </div>
          </div>

          {activeTab === "Objective" && <ObjectivePermissions />}
          {activeTab === "CheckIn" && <CheckInPermissions />}
          {activeTab === "OneOnOne" && <OneOnOnePermissions />}
          {activeTab === "Performance" && <PerformancePermissions />}
        </V3Card>
      </div>
    </div>
  );
};

export default Page;