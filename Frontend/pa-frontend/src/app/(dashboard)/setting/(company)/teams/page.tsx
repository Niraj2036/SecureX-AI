"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Adminsheet from "@/components/setting-components/okradmin-navbarsheet";
import Inviteusers from "@/components/setting-components/invite-usersheet";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";

interface Team {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  parent?: { name: string; parentId?: string };
  users?: any[];
  avatar?: string | null;
}

const Teams = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: teamData, isLoading } = useQuery({
    queryKey: ["teams_settings", currentPage],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams?pageNo=${currentPage}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  useEffect(() => {
    if (teamData?.data?.pagination) {
      setTotalTeams(teamData.data.pagination.totalTeams || 0);
      setPaginationPages(teamData.data.pagination.totalPages || 1);
    }
  }, [teamData]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["teams_settings"] });
  }, [currentPage, queryClient]);

  const teams: Team[] = teamData?.data?.data || [];

  const { mutate: deleteTeam, status: deleteStatus } = useMutation({
    mutationFn: async (teamId: string) => {
      return axios.delete(`${backendUrl}/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
    },
    onSuccess: (_, teamId) => {
      const deleted = teams.find((t) => t.id === teamId);
      toast({ title: "Team deleted", description: `${deleted?.name} has been removed.`, duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["teams_settings"] });
      setSelectedId(null);
    },
    onError: () => {
      toast({ title: "Error deleting team", description: "Could not delete team.", duration: 3000 });
    },
  });

  const isDeleting = deleteStatus === "pending";
  const selectedTeam = teams.find((t) => t.id === selectedId);

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Teams"
        description="Manage organizational teams within departments."
        badgeText={`${totalTeams} Teams`}
        badgeIcon={<Users className="h-3 w-3 text-indigo-600" />}
      >
        <div className="flex items-center gap-2">
          {selectedTeam && (
            <V3Button
              variant="danger"
              onClick={() => deleteTeam(selectedTeam.id)}
              isLoading={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </V3Button>
          )}
          <Adminsheet type="team">
            <V3Button variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Team
            </V3Button>
          </Adminsheet>
          <Inviteusers>
            <V3Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Add User
            </V3Button>
          </Inviteusers>
        </div>
      </V3PageHeader>

      <V3Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => !e.target.checked && setSelectedId(null)}
                    className="rounded border-border"
                  />
                </th>
                <th className="p-3.5">Team Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-center">Team Size</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="h-12 animate-pulse bg-muted/20" />
                  </tr>
                ))
              ) : teams.length > 0 ? (
                teams.map((team) => (
                  <tr
                    key={team.id}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedId === team.id ? "bg-indigo-500/5" : ""}`}
                    onClick={() => setSelectedId(selectedId === team.id ? null : team.id)}
                  >
                    <td className="p-3.5 pl-4">
                      <input
                        type="checkbox"
                        checked={selectedId === team.id}
                        onChange={() => setSelectedId(selectedId === team.id ? null : team.id)}
                        className="rounded border-border"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 font-bold text-xs flex items-center justify-center border border-violet-500/20">
                          {team.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{team.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {team.parent?.name || "—"}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-500/20">
                        {team.users?.length || 0} members
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <V3Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTeam(team.id);
                        }}
                        isLoading={isDeleting && selectedId === team.id}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </V3Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No teams found. Create your first team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>Page {currentPage} of {paginationPages}</span>
          <div className="flex items-center gap-1.5">
            <V3Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </V3Button>
            {Array.from({ length: paginationPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {page}
              </button>
            ))}
            <V3Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(paginationPages, p + 1))}
              disabled={currentPage === paginationPages}
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </V3Button>
          </div>
        </div>
      </V3Card>
    </div>
  );
};

export default Teams;