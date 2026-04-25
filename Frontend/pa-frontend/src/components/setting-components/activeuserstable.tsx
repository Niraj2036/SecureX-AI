"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import profile from "../../../public/employee/profile.png";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Pagination, PaginationContent, PaginationItem } from "../ui/pagination";
import { useDebounce } from "../ui/multiselect";
import Link from "next/link";

interface User {
  id: string;
  avatar: string | null;
  tenantId: string;
  name: string;
  email: string;
  phoneCode: string;
  mobile: string;
  teamId: string | null;
  managerId: string | null;
  joiningDate: string | null;
  designation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  manager:{
    id:string;
    name:string
  }
  data: Record<string, any>;
  role: string;
  team:{
    id:string;
    name:string;
    parentId:string;
    avatar:string;
  }
}


const columns: ColumnDef<User>[] = [
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
      <Link href={`/user-profiles?id=${row.original.id}`} className="flex items-center hover:text-blue-500">
        <Avatar className="mr-2">
          <AvatarImage src={row.original.avatar || undefined} alt={`${row.original.name}'s avatar`} className="hover:opacity-20" />
          <AvatarFallback className="hover:opacity-20">
            {row.original.name[0].toUpperCase()}
            {/* {row.original.name[1].toUpperCase()} */}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span>{row.original.name}</span>
          <span className="text-sm text-gray-500">{row.original.email}</span>
        </div>
      </Link>
    ),
  },
  { accessorKey: "joined", header: "Joined on",
    cell: ({ row }) => (
      <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
    ),
  },
  { accessorKey :"designation", header: "Designation" },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => (
      <span>{row.original.manager?.name}</span>
    ),
  },
];

function ActiveUsers() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1); // Track current page
  const debouncedPage = useDebounce(currentPage, 300);

  const { data: userData = [], isError, isLoading } = useQuery({
    queryKey: ["users", session?.user.token,debouncedPage],
    enabled: status === "authenticated",
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/users?pageNo=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      return response.data.data; 
    },
  });

  React.useEffect(()=>{
    if(userData.pagination){
      setPaginationPages(userData?.pagination?.totalPages)
    }
  },[userData])

  // const queryClient = useQueryClient();
  // React.useEffect(() => {
  //   queryClient.invalidateQueries({ queryKey: ["users"] });
  // }, [currentPage, queryClient]);


  const table = useReactTable({
    data: userData.data || [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full px-4">
      <div className="rounded-md border">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : isError ? (
          <div className="text-center py-4 text-red-500">Error loading data.</div>
        ) : (
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
                    Loading data...
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
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
  );
}

export default ActiveUsers