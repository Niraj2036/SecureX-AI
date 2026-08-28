"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Network,
  FileText,
  UserPlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Briefcase,
} from "lucide-react";
import { V3Card, V3StatCard } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

function getTimeBasedGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good morning";
  if (currentHour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Page() {
  const { data: session } = useSession();
  const greeting = getTimeBasedGreeting();

  // Fetch Dashboard & Users Metrics
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["dashboardUsers"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/users?pageNo=1&pageSize=6`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  const { data: companyData } = useQuery({
    queryKey: ["dashboardCompany"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/company`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  const { data: teamsData } = useQuery({
    queryKey: ["dashboardTeams"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  const { data: docsData } = useQuery({
    queryKey: ["dashboardDocs"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/documents`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  // Safely parse users response array & metrics
  const rawUsers = Array.isArray(usersData?.data?.data)
    ? usersData.data.data
    : Array.isArray(usersData?.data)
    ? usersData.data
    : Array.isArray(usersData)
    ? usersData
    : [];

  const totalEmployees =
    usersData?.pagination?.totalCount ||
    usersData?.pagination?.totalItems ||
    usersData?.data?.pagination?.totalItems ||
    rawUsers.length;

  const recentUsers = rawUsers.slice(0, 5);
  const company = companyData?.data || companyData;

  const rawTeams = Array.isArray(teamsData?.data?.data)
    ? teamsData.data.data
    : Array.isArray(teamsData?.data)
    ? teamsData.data
    : [];

  const rawDocs = Array.isArray(docsData?.data?.data)
    ? docsData.data.data
    : Array.isArray(docsData?.data)
    ? docsData.data
    : [];

  const totalTeams = rawTeams.length;
  const totalDocs = rawDocs.length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="v3-card relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-indigo-600 via-violet-600 to-slate-900 text-white border-0 shadow-xl rounded-xl">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white border border-white/20 backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-1 text-amber-300" />
            V3 Enterprise Workspace
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {greeting}, {session?.user?.name || "Admin"}
          </h1>
          <p className="text-indigo-100 text-sm md:text-base">
            Welcome to <span className="font-semibold">{company?.name || "SecureX AI"}</span>. Manage your workforce, teams, and organizational structure seamlessly.
          </p>
        </div>
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none text-white">
          <Building2 className="w-96 h-96" />
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <V3StatCard
          title="Total Employees"
          value={usersLoading ? "..." : totalEmployees}
          subtitle="Active directory members"
          icon={<Users className="h-5 w-5" />}
          iconBg="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
        />

        <V3StatCard
          title="Teams & Groups"
          value={totalTeams}
          subtitle="Configured teams & departments"
          icon={<Building2 className="h-5 w-5" />}
          iconBg="bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
        />

        <V3StatCard
          title="Organization Structure"
          value="Tree Chart"
          subtitle="Visual manager hierarchy"
          icon={<Network className="h-5 w-5" />}
          iconBg="bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
        />

        <V3StatCard
          title="Documents Vault"
          value={totalDocs}
          subtitle="Shared & protected files"
          icon={<FileText className="h-5 w-5" />}
          iconBg="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        />
      </div>

      {/* Quick Actions Hub */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/employee">
            <V3Card className="group cursor-pointer hover:border-indigo-500/50 transition-all p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">Employee Directory</h3>
                  <p className="text-xs text-muted-foreground">Manage & add employees</p>
                </div>
              </div>
            </V3Card>
          </Link>

          <Link href="/employee/orgchart">
            <V3Card className="group cursor-pointer hover:border-violet-500/50 transition-all p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-violet-600 transition-colors">Org Hierarchy</h3>
                  <p className="text-xs text-muted-foreground">Explore chart tree</p>
                </div>
              </div>
            </V3Card>
          </Link>

          <Link href="/documents">
            <V3Card className="group cursor-pointer hover:border-amber-500/50 transition-all p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-amber-600 transition-colors">Documents Repository</h3>
                  <p className="text-xs text-muted-foreground">View & grant file access</p>
                </div>
              </div>
            </V3Card>
          </Link>

          <Link href="/chat">
            <V3Card className="group cursor-pointer hover:border-purple-500/50 transition-all p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-purple-600 transition-colors">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask questions & audit</p>
                </div>
              </div>
            </V3Card>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Employees & Company Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees List */}
        <V3Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Employee Roster</h3>
              <p className="text-xs text-muted-foreground">Latest team members added to your organization</p>
            </div>
            <Link href="/employee">
              <V3Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </V3Button>
            </Link>
          </div>
          <div className="pt-2">
            {usersLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading employee directory...</div>
            ) : recentUsers.length > 0 ? (
              <div className="divide-y divide-border/40">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="py-3 flex items-center justify-between hover:bg-muted/30 px-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-muted-foreground/70" />
                          {user.designation || "Team Member"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20 capitalize">
                        {user.status || "Active"}
                      </span>
                      <Link href={`/user-profiles?id=${user.id}`}>
                        <V3Button variant="outline" size="sm">
                          Profile
                        </V3Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">No employees found.</div>
            )}
          </div>
        </V3Card>

        {/* Company Identity Summary */}
        <V3Card className="p-5 space-y-4">
          <div className="pb-3 border-b border-border/60">
            <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
              <Building className="h-4 w-4 text-indigo-600" />
              Organization Identity
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Company registration & tenant settings</p>
          </div>
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Company Name</span>
              <p className="font-semibold text-sm text-foreground">{company?.name || "SecureX AI Enterprise"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Domain</span>
              <p className="font-medium text-foreground">{company?.domain || "securexai.app"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Industry</span>
              <p className="font-medium text-foreground capitalize">{company?.industry?.replace('_', ' ') || "Technology"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Employee Size</span>
              <p className="font-medium text-foreground capitalize">{company?.employeeSize?.replace('_', ' ') || "Enterprise"}</p>
            </div>
            <div className="pt-3 border-t border-border/60">
              <Link href="/setting">
                <V3Button variant="outline" className="w-full">
                  Manage Organization Settings
                </V3Button>
              </Link>
            </div>
          </div>
        </V3Card>
      </div>
    </div>
  );
}