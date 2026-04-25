"use client";

import * as React from "react";

import { Check, Cross, Edit, Loader2, X } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import MultipleSelector, { useDebounce } from "@/components/ui/multiselect";
import axios from "axios";
import filter from "../../../../../public/employee/filter.png";
import sort from "../../../../../public/employee/sort.png";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

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
}

function MultiSelectDemo({ team }: { team: Team }) {
  const [selected, setSelected] = React.useState<User[]>(team.users);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  const updateTeamMutation = useMutation({
    mutationFn: (updatedUsers: User[]) =>
      axios.patch(
        `${backendUrl}/teams/${team.id}/users`,
        { userIds: updatedUsers.map(user => user.id) },
        {
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      ),
    onSuccess: () => {
      toast({
        title: "Team updated successfully",
        description: "Team members have been updated.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
    onError: (error:any) => {
      toast({
        title: "Failed to update the team",
        description: error.response?.data?.message || "Failed to update team members.",
        duration: 3000,
      });
    },
  });

  const handleDone = () => {
    updateTeamMutation.mutate(selected);
    setIsEditMode(false);
  };

  const removeUser = (id: string) => {
    setSelected(prev => prev.filter(user => user.id !== id));
  };

  return (
    <div className="space-y-2 relative">
      <div className="relative">
        <div className={`w-full border ${isEditMode ? 'border-blue-500' : 'border-gray-200'} h-auto rounded-md flex items-center justify-between flex-row px-3 py-2 transition-colors`}>
          <div className="w-full flex flex-wrap gap-2">
            {selected.length > 0 ? (
              selected.map((user) => (
                <div
                  key={user.id}
                  className={`gap-1 px-3 py-1 flex items-center justify-between rounded-full text-xs font-medium transition-all ${
                    isEditMode 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{user.name}</span>
                    {isEditMode && (
                      <button
                        className="ml-1 p-0.5 rounded-full hover:bg-primary-300 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUser(user.id);
                        }}
                      >
                        <X size={14} className="text-blue-800" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">
                {isEditMode ? 'Add members to this team' : 'No members in this team'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {isEditMode ? (
              <button
                onClick={handleDone}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                disabled={updateTeamMutation.isPending}
              >
                {updateTeamMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </button>
            ) : (
              <button
                onClick={toggleEditMode}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Page() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const debouncedPage = useDebounce(currentPage, 300);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
  const { data: session, status } = useSession();
  const [totalTeams, setTotalEmployee] = useState<number>(0);

  const {
    data: teamData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["teams", status, debouncedPage],
    enabled: status === "authenticated",
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams?pageNo=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      return response.data.data;
    },
  });
  useEffect(() => {
    if (teamData?.pagination) {
      setTotalEmployee(teamData.pagination.totalTeams);
      setPaginationPages(teamData.pagination.totalPages);
    }
  }, [teamData]);
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });
  }, [currentPage, queryClient]);

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Team Name",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "name",
      header: "Team Members",
      cell: ({ row }) => <MultiSelectDemo team={row.original} />,
    },
    {
      accessorKey: "parent",
      header: "Department",
      cell: (info) => (
        <div>
          {info.row.original.parent
            ? info.row.original.parent.name
            : "No Department Assigned"}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: teamData?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>

      <div className="w-full px-4">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center">
            <div className="w-7 m-2 h-7 rounded-full bg-[#45AEA9] flex items-center justify-center text-white">
              {totalTeams}
            </div>
            <p className="ml-2 text-slate-600 font-bold">Teams</p>
          </div>

          <div className="flex items-center">
            {/* <Image src={filter} alt="filter" className="w-20 h-9 mr-2" />
            <Image src={sort} alt="sorting" className="w-20 h-9 mr-2" /> */}
            
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="h-20">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="pt-2 my-3">
          <Pagination>
            <PaginationContent className="flex justify-between items-center w-full">
              <PaginationItem>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 ${currentPage === 1 ? "text-gray-400" : "text-black hover:text-green-800"}`}
                >
                  Prev
                </button>
              </PaginationItem>
              <div className="flex gap-2">
                {paginationPages > 0 &&
                  Array.from({ length: paginationPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 ${currentPage === page ? "bg-secondary-400 text-white rounded-md" : "text-black hover:text-green-800"
                          }`}
                      >
                        {page}
                      </button>
                    </PaginationItem>
                  ))}
              </div>
              <PaginationItem>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationPages))}
                  disabled={currentPage === paginationPages}
                  className={`px-3 py-2 ${currentPage === paginationPages ? "text-gray-400" : "text-black hover:text-green-800"}`}
                >
                  Next
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}

export default Page;
