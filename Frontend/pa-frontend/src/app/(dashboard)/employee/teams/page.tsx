"use client";

import * as React from "react";
import { Check, Edit, Loader2, X, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MultipleSelector, { useDebounce } from "@/components/ui/multiselect";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";

interface User {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
}

interface Team {
  id: string;
  name: string;
  users: User[];
  parent?: { name: string } | null;
}

function MemberEditor({ team }: { team: Team }) {
  const [selected, setSelected] = React.useState<User[]>(team.users);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const updateTeamMutation = useMutation({
    mutationFn: (updatedUsers: User[]) =>
      axios.patch(
        `${backendUrl}/teams/${team.id}/users`,
        { userIds: updatedUsers.map((u) => u.id) },
        { headers: { Authorization: `Bearer ${session?.user.token}` } }
      ),
    onSuccess: () => {
      toast({ title: "Team updated", description: "Team members have been updated.", duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["employee_teams"] });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.response?.data?.message || "Could not update team members.", duration: 3000 });
    },
  });

  const handleDone = () => {
    updateTeamMutation.mutate(selected);
    setIsEditMode(false);
  };

  const removeUser = (id: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {selected.length > 0 ? (
        selected.map((user) => (
          <span
            key={user.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              isEditMode
                ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                : "bg-muted text-muted-foreground border border-border/50"
            }`}
          >
            {user.name}
            {isEditMode && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeUser(user.id); }}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X size={11} />
              </button>
            )}
          </span>
        ))
      ) : (
        <span className="text-xs text-muted-foreground italic">
          {isEditMode ? "Add members" : "No members"}
        </span>
      )}
      <div className="ml-auto">
        {isEditMode ? (
          <button
            type="button"
            onClick={handleDone}
            disabled={updateTeamMutation.isPending}
            className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex items-center justify-center"
          >
            {updateTeamMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="h-7 w-7 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground flex items-center justify-center"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Page() {
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const debouncedPage = useDebounce(currentPage, 300);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
  const { data: session, status } = useSession();
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const queryClient = useQueryClient();

  const { data: teamData, isLoading } = useQuery({
    queryKey: ["employee_teams", status, debouncedPage],
    enabled: status === "authenticated",
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams?pageNo=${currentPage}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return response.data.data;
    },
  });

  useEffect(() => {
    if (teamData?.pagination) {
      setTotalTeams(teamData.pagination.totalTeams);
      setPaginationPages(teamData.pagination.totalPages);
    }
  }, [teamData]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["employee_teams"] });
  }, [currentPage, queryClient]);

  const teams: Team[] = teamData?.data || [];

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Teams"
        description="View and manage team memberships across your organization."
        badgeText={`${totalTeams} Teams`}
        badgeIcon={<Users className="h-3 w-3 text-indigo-600" />}
      />

      <V3Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4">Team Name</th>
                <th className="p-3.5">Members</th>
                <th className="p-3.5">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={3} className="h-14 animate-pulse bg-muted/20" />
                  </tr>
                ))
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <tr key={team.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 font-bold text-xs flex items-center justify-center border border-violet-500/20">
                          {team.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{team.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 min-w-[300px]">
                      <MemberEditor team={team} />
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {team.parent?.name || "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="h-32 text-center text-xs text-muted-foreground">
                    No teams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {currentPage} of {paginationPages}</span>
          <div className="flex items-center gap-1.5">
            <V3Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </V3Button>
            {Array.from({ length: paginationPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${currentPage === page ? "bg-indigo-600 text-white" : "hover:bg-muted text-muted-foreground"}`}>
                {page}
              </button>
            ))}
            <V3Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(paginationPages, p + 1))} disabled={currentPage === paginationPages}>
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </V3Button>
          </div>
        </div>
      </V3Card>
    </div>
  );
}

export default Page;