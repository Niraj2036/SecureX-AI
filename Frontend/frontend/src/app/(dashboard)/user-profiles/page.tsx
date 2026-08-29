"use client";

import { useSearchParams } from "next/navigation";
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";
import { Mail, Briefcase, Building2, Users, Calendar, ShieldCheck, FileText, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { V3Card } from "@/components/v3/V3Card";

const Page = () => {
  const { data: userSession } = useSession();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { userDetails } = useSessionStore((state) => state);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [activeTab, setActiveTab] = useState<"overview" | "documents">("overview");

  const targetId = userId || userDetails?.id;

  const { data: userProfileData, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ["useDataforProfile", targetId],
    queryFn: async () => {
      const url = targetId === userDetails?.id
        ? `${backendUrl}/users/me`
        : `${backendUrl}/users/${targetId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${userSession?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!targetId && !!userSession?.user?.token,
  });

  if (profileLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="text-sm">Loading employee profile...</span>
        </div>
      </div>
    );
  }

  if (profileError || !userProfileData?.data) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-destructive">Unable to load profile</h3>
        <p className="text-sm text-muted-foreground mt-1">The requested employee details could not be retrieved.</p>
      </div>
    );
  }

  const user = userProfileData.data;
  const statusColor = user?.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20";
  const roleColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";

  return (
    <div className="space-y-6">
      {/* Profile Hero Banner */}
      <div className="v3-card relative overflow-hidden p-6 md:p-8 bg-gradient-to-r from-amber-600 via-amber-600 to-slate-900 text-white border-0 shadow-xl rounded-xl">
        <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
          <User className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold tracking-tight">{user?.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border bg-white/15 text-white border-white/25 capitalize`}>
                {user?.status || "Active"}
              </span>
            </div>
            <p className="text-amber-100 text-sm flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {user?.designation || "Team Member"}
            </p>
            <p className="text-amber-300 text-xs flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold text-white capitalize">
              <ShieldCheck className="h-3 w-3 mr-1.5" />
              {user?.role || "Employee"}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border/60">
        {(["overview", "documents"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "overview" ? "Overview" : "Documents"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Details */}
          <V3Card className="p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-4">
              <Building2 className="h-4 w-4 text-amber-600" />
              Organization Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Department", value: user?.department?.name || "N/A" },
                { label: "Team", value: user?.team?.name || "N/A" },
                { label: "Direct Manager", value: user?.manager?.name || "N/A" },
                { label: "Employee ID", value: user?.empId || user?.id?.substring(0, 8) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </V3Card>

          {/* Employment Information */}
          <V3Card className="p-5">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-4">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              Employment Information
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Joining Date", value: user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "N/A" },
                { label: "Account Status", value: user?.status || "Active" },
                { label: "System Role", value: user?.role || "Employee" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground capitalize">{value}</span>
                </div>
              ))}
            </div>
          </V3Card>
        </div>
      )}

      {activeTab === "documents" && (
        <V3Card className="p-5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-4">
            <FileText className="h-4 w-4 text-amber-600" />
            Employee Documents
          </h3>
          {user?.employeeDocuments && user.employeeDocuments.length > 0 ? (
            <div className="divide-y divide-border/40">
              {user.employeeDocuments.map((doc: any) => (
                <div key={doc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline flex items-center gap-1">
                    View <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-sm">No employee documents attached.</div>
          )}
        </V3Card>
      )}
    </div>
  );
};

export default Page;
