"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Network,
  Building2,
  FileText,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface SubNavItem {
  name: string;
  url: string;
}

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubNavItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function V3Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSettings, setOpenSettings] = useState(pathname.startsWith("/setting"));

  const navGroups: NavGroup[] = [
    {
      title: "WORKSPACE",
      items: [
        { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { name: "Employee Directory", url: "/employee", icon: Users },
        { name: "Org Hierarchy", url: "/employee/orgchart", icon: Network },
        { name: "Teams & Groups", url: "/employee/teams", icon: Building2 },
        { name: "Documents Vault", url: "/documents", icon: FileText },
        { name: "AI Assistant", url: "/chat", icon: Sparkles },
      ],
    },
    {
      title: "SYSTEM & ADMINISTRATION",
      items: [
        {
          name: "Organization Settings",
          url: "/setting",
          icon: Settings,
          subItems: [
            { name: "Company Profile", url: "/setting" },
            { name: "Departments", url: "/setting/departments" },
            { name: "Teams", url: "/setting/teams" },
            { name: "Role Templates", url: "/setting/profiles" },
            { name: "Import Data", url: "/setting/importdata" },
          ],
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            S
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight block leading-none">
              SecureX AI
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase block mt-0.5">
              V3 Enterprise
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url));
                const Icon = item.icon;

                if (item.subItems) {
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => setOpenSettings(!openSettings)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                        {openSettings ? (
                          <ChevronUp className="h-3.5 w-3.5 opacity-70" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                        )}
                      </button>

                      {openSettings && (
                        <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 py-1">
                          {item.subItems.map((sub) => {
                            const isSubActive = pathname === sub.url;
                            return (
                              <Link
                                key={sub.name}
                                href={sub.url}
                                className={`block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                                  isSubActive
                                    ? "text-indigo-400 font-semibold bg-slate-800/60"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60">
          <div className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
            {session?.user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {session?.user?.name || "Admin User"}
            </p>
            <p className="text-[10px] text-slate-400 truncate leading-tight">
              {session?.user?.email || "admin@securexai.app"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
