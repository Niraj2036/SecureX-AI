"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { Search, UserPlus, Users, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";
import { V3Input } from "@/components/v3/V3Input";
import { V3Select } from "@/components/v3/V3Select";
import { V3Modal } from "@/components/v3/V3Modal";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function EmployeePage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite Modal state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");
  const [inviteDesignation, setInviteDesignation] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchUserData = async () => {
    let url = `${backendUrl}/users?pageNo=${currentPage}&pageSize=10`;
    if (searchText.trim()) {
      url += `&search=${encodeURIComponent(searchText.trim())}`;
    }
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${session?.user?.token}` },
    });
    return response.data;
  };

  const { data: userDataResponse, isLoading } = useQuery({
    queryKey: ["usersDirectory", currentPage, searchText],
    enabled: status === "authenticated" && !!session?.user?.token,
    queryFn: fetchUserData,
  });

  const employees = userDataResponse?.data?.data || [];
  const pagination = userDataResponse?.data?.pagination || userDataResponse?.pagination || {};
  const totalEmployees = pagination?.totalItems || employees.length;
  const totalPages = pagination?.totalPages || Math.ceil(totalEmployees / 10) || 1;

  // Filtered locally by status & role if specified
  const filteredEmployees = employees.filter((emp: any) => {
    if (statusFilter !== "all" && emp.status !== statusFilter) return false;
    if (roleFilter !== "all" && emp.role !== roleFilter) return false;
    return true;
  });

  const handleInviteEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setInviteLoading(true);
    try {
      await axios.post(
        `${backendUrl}/users/invite`,
        {
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
          designation: inviteDesignation || "Team Member",
        },
        {
          headers: { Authorization: `Bearer ${session?.user?.token}` },
        }
      );
      toast({ title: "Invitation Sent", description: `Invitation sent to ${inviteEmail}` });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteDesignation("");
      queryClient.invalidateQueries({ queryKey: ["usersDirectory"] });
    } catch (error: any) {
      toast({
        title: "Invitation Failed",
        description: error?.response?.data?.message || "Error sending invitation",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* V3 Page Header */}
      <V3PageHeader
        title="Employee Directory"
        description="Manage employees, organizational roles, team assignments, and profile access."
        badgeText={`${totalEmployees} Members`}
        badgeIcon={<Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
      >
        <V3Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Employee
        </V3Button>
      </V3PageHeader>

      {/* Invite Modal Dialog */}
      <V3Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Add New Employee"
        description="Send an onboarding invitation link to add an employee to your organization."
      >
        <form onSubmit={handleInviteEmployee} className="space-y-4">
          <V3Input
            label="Full Name"
            placeholder="Jane Doe"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />

          <V3Input
            label="Work Email"
            type="email"
            placeholder="jane.doe@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <V3Input
            label="Job Title / Designation"
            placeholder="Senior Software Engineer"
            value={inviteDesignation}
            onChange={(e) => setInviteDesignation(e.target.value)}
          />

          <V3Select
            label="Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: "employee", label: "Employee" },
              { value: "team_lead", label: "Team Lead" },
              { value: "dept_head", label: "Department Head" },
              { value: "admin", label: "Administrator" },
            ]}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-border/60">
            <V3Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </V3Button>
            <V3Button type="submit" isLoading={inviteLoading}>
              Send Invitation
            </V3Button>
          </div>
        </form>
      </V3Modal>

      {/* Filter & Search Bar */}
      <V3Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <V3Input
            placeholder="Search by name or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Status:</span>
            <V3Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-32"
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "banned", label: "Banned" },
              ]}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground font-medium">Role:</span>
            <V3Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-32"
              options={[
                { value: "all", label: "All Roles" },
                { value: "admin", label: "Admin" },
                { value: "dept_head", label: "Dept Head" },
                { value: "team_lead", label: "Team Lead" },
                { value: "employee", label: "Employee" },
              ]}
            />
          </div>
        </div>
      </V3Card>

      {/* Table Container */}
      <V3Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Employee</th>
                <th className="p-3.5">Job Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Team</th>
                <th className="p-3.5">Manager</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={7} className="h-12 animate-pulse bg-muted/20" />
                  </tr>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                          {emp.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{emp.name}</p>
                          <p className="text-[11px] text-muted-foreground leading-tight">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium">{emp.designation || "Team Member"}</td>
                    <td className="p-3.5 text-muted-foreground">{emp.department?.name || "N/A"}</td>
                    <td className="p-3.5 text-muted-foreground">{emp.team?.name || "N/A"}</td>
                    <td className="p-3.5 text-muted-foreground">{emp.manager?.name || "N/A"}</td>

                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20 capitalize">
                        {emp.status || "Active"}
                      </span>
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <Link href={`/user-profiles?id=${emp.id}`}>
                        <V3Button variant="outline" size="sm">
                          Profile
                        </V3Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No employees found matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <V3Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </V3Button>
            <V3Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </V3Button>
          </div>
        </div>
      </V3Card>
    </div>
  );
}