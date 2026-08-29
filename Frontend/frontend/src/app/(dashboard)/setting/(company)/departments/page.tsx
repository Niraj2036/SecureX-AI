"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Adminsheet from "@/components/setting-components/admin-navbarsheet";
import Inviteusers from "@/components/setting-components/invite-usersheet";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";

interface Department {
  id: string;
  name: string;
  type: string;
  avatar?: string | null;
  parentId?: string | null;
}

const Department = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data: session } = useSession();
  const [totalDepartments, setTotalDepartments] = useState<number>(0);
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: teamData, isLoading } = useQuery({
    queryKey: ["departments", currentPage],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams/dept?pageNo=${currentPage}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  useEffect(() => {
    if (teamData?.data?.pagination) {
      setTotalDepartments(teamData.data.pagination.totalTeams || 0);
      setPaginationPages(teamData.data.pagination.totalPages || 1);
    }
  }, [teamData]);

  const departments: Department[] = (teamData?.data?.data || []).filter(
    (d: Department) => d.type === "department"
  );

  const { mutate: deleteDepartment, status: deleteStatus } = useMutation({
    mutationFn: async (departmentId: string) => {
      return axios.delete(`${backendUrl}/teams/${departmentId}`, {
        headers: { Authorization: `Bearer ${session?.user.token}` },
      });
    },
    onSuccess: (_, departmentId) => {
      const deleted = departments.find((d) => d.id === departmentId);
      toast({ title: "Department deleted", description: `${deleted?.name} has been removed.`, duration: 3000 });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setSelectedId(null);
    },
    onError: () => {
      toast({ title: "Error deleting department", description: "Could not delete department.", duration: 3000 });
    },
  });

  const isDeleting = deleteStatus === "pending";
  const selectedDepartment = departments.find((d) => d.id === selectedId);

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="Departments"
        description="Manage organizational departments and their membership."
        badgeText={`${totalDepartments} Departments`}
        badgeIcon={<Building2 className="h-3 w-3 text-amber-600" />}
      >
        <div className="flex items-center gap-2">
          {selectedDepartment && (
            <V3Button
              variant="danger"
              onClick={() => deleteDepartment(selectedDepartment.id)}
              isLoading={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </V3Button>
          )}
          <Adminsheet type="department">
            <V3Button variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Department
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
        {/* Table */}
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
                <th className="p-3.5">Department Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={4} className="h-12 animate-pulse bg-muted/20" />
                  </tr>
                ))
              ) : departments.length > 0 ? (
                departments.map((dept) => (
                  <tr
                    key={dept.id}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedId === dept.id ? "bg-amber-500/5" : ""}`}
                    onClick={() => setSelectedId(selectedId === dept.id ? null : dept.id)}
                  >
                    <td className="p-3.5 pl-4">
                      <input
                        type="checkbox"
                        checked={selectedId === dept.id}
                        onChange={() => setSelectedId(selectedId === dept.id ? null : dept.id)}
                        className="rounded border-border"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                          {dept.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{dept.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-500/20 capitalize">
                        {dept.type || "Department"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <V3Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDepartment(dept.id);
                        }}
                        isLoading={isDeleting && selectedId === dept.id}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </V3Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                    No departments found. Create your first department.
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
                    ? "bg-amber-600 text-white"
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

export default Department;