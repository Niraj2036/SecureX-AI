"use client";

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
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import axios from "axios";
import filter from "../../../../../../public/employee/filter.png";
import profile from "../../../../../../public/employee/profile.png";
import sort from "../../../../../../public/employee/sort.png";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Adminsheet from "@/components/setting-components/okradmin-navbarsheet";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { useDebounce } from "@/components/ui/multiselect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Inviteusers from "@/components/setting-components/invite-usersheet";
import { Plus } from "lucide-react";

interface Team {
  id: string;
  name: string;
  parentId: string | null;
  parent: {
    name: string;
    parentId: string
  }
}

interface Employee {
  id: string;
  avatar: string | null;
  tenantId: string;
  name: string;
  teamId: string | null;
  managerId: string | null;
  joiningDate: string | null;
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  role: string;
  jobTitle?: string;
  manager?: string;
  company?: string;
  type: string;
  department?: string;
  users: Team[];
  parent: {
    name: string;
    parentId: string
  }
}
const columns: ColumnDef<Employee>[] = [
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
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Avatar className="mr-2">
          <AvatarImage src={row.original.avatar || undefined} alt={`${row.original?.name}'s avatar`} />
          <AvatarFallback>
            {row.original?.name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span>{row.original.name}</span>
        </div>
      </div>
    ),
  },
  // { accessorKey: "designation", header: "Job Title" },
  // { accessorKey: "managerId", header: "Manager" },
  // { accessorKey: "department", header: "Department", cell: ({ row }) => <div>{row.original.parent.name}</div> },
  {
    accessorKey: "Department Name",
    header: "Department Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="mr-2">{row.original.parent.name || "No Team Assigned"}</div>
      </div>
    ),
  },
  {
    accessorKey: "Team Size",
    header: "Team Size",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="mr-2">{row.original.users.length || 0}</div>
      </div>
    ),
  },
];

const Teams = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session } = useSession();
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const debouncedPage = useDebounce(currentPage, 300);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const {
    data: teamData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["teams", debouncedPage],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams?pageNo=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      console.log(response.data);
      return response.data;
    },
  });

  useEffect(() => {
    if (teamData?.data.pagination) {
      console.log(teamData, "rishi data consoled");
      setTotalTeams(teamData.data.pagination.totalTeams);
      setPaginationPages(teamData.data.pagination.totalPages);
    }
    console.log(teamData, "rishi data consoled");
  }, [teamData]);

  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["teams"] });
  }, [currentPage, queryClient]);

  const table = useReactTable({
    data: teamData?.data.data || [],
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
  const rowModel = table.getRowModel();
  const { mutate: deleteDepartment, status: deleteStatus } = useMutation({
    mutationFn: async (departmentId: string) => {
      return axios.delete(`${backendUrl}/teams/${departmentId}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
    },
    onSuccess: (_, departmentId) => {
      const deletedDepartment = rowModel?.rows.find(
        (row) => row.original.id === departmentId
      )?.original;
      toast({
        title: "Team deleted",
        description: `You have deleted ${deletedDepartment?.name}`,
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setRowSelection({});
    },
    onError: (error) => {
      toast({
        title: "Error deleting department",
        description: "There was an error deleting the department",
        duration: 3000,
      })
      console.error("Error deleting department:", error);
    }
  });

  const isDeleting = deleteStatus === 'pending';
  const selectedRow = Object.keys(rowSelection)[0];
  const selectedDepartment = rowModel?.rows.find(
    (row) => row.id === selectedRow
  )?.original;


  // console.log(teamData, "rishi data consoled");
  return (
    // <div className="flex p-4 bg-gray-100 min-h-screen">
    //   <SettingSidebar />

    <Card className="w-full max-w-4xl  bg-white  shadow-sm">
      <div className="w-full px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            {/* <Image src={two} alt="two" className="w-7 ml-2" />
             */}
            <div className="w-7 rounded-full h-7 flex justify-center items-center text-white  bg-[#189D92] ml-2">
              {totalTeams}
            </div>

            <p className="ml-2 text-slate-600">Teams</p>
          </div>

          <div className="flex items-center">
            {/* <Image src={filter} alt="filter" className="w-20 h-9 mr-2" /> */}
            {/* <Image src={sort} alt="sorting" className="w-20 h-9 mr-2" /> */}
            <Adminsheet type="team" />
            {selectedDepartment && (
              <Button
                variant="destructive"
                onClick={() => deleteDepartment(selectedDepartment.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Inviteusers>
              <Button className=" bg-white text-slate-500 hover:bg-secondary-200 border  flex items-center space-x-2 mx-2">
                <Plus />
                Add User
              </Button>
            </Inviteusers>
          </div>
        </div>
        <div className="rounded-md border mb-4 ">
          <Table className="mb-2 ">
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
              {rowModel?.rows.filter((row) => row.original.type === "team")
                .length ? (
                rowModel.rows
                  .filter((row) => row.original.type === "team")
                  .map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
    </Card>
  );
};

export default Teams;
