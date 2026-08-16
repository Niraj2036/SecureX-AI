import React from "react";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { V3Header } from "@/components/v3/V3Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* V3 Pure React + Tailwind Left Rail Sidebar */}
      <V3Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <V3Header />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}