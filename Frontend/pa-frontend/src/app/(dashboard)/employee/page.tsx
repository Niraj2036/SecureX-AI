"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import SearchInput from "@/components/ui/serach-input";
import axios from "axios";
import filter from "../../../../public/employee/filter.png";
import profile from "../../../../public/employee/profile.png";
import sort from "../../../../public/employee/sort.png";
import two from "../../../../public/employee/two.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useDebounce } from "@/components/ui/multiselect";
import Link from "next/link";

// import { TopBarEmployee } from "./teams/page";

interface Employee {
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
  data: Record<string, any>;
  role: string;
  jobTitle?: string;
  manager?: {
    id: string;
    name: string;
  };
  company?: string;
  department: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
    parentId: string;
    avatar: string;
  };
}
const getRoleBadgeStyles = (role:string) => {
  switch (role) {
    case 'admin':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        hover: 'hover:bg-red-100',
        border: 'border-red-500'
      };
    case 'team_lead':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-500'
      };
    case 'dept_head':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-500'
      };
    case 'employee':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        hover: 'hover:bg-green-100',
        border: 'border-green-500'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        hover: 'hover:bg-gray-100',
        border: 'border-gray-500'
      };
  }
};

const formatRoleDisplay = (role: string): string => {
  return role
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};



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
      <div className="hover:text-blue-500 flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={row.original.avatar || undefined}
            alt={`${row.original.name}'s avatar`}
            className="hover:opacity-20"
          />
          <AvatarFallback className="hover:opacity-20">
            {row.original.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>{row.original.name}</span>
            <Badge 
              className={`${ getRoleBadgeStyles(row.original.role).bg} ${ getRoleBadgeStyles(row.original.role).text} ${ getRoleBadgeStyles(row.original.role).hover} border ${ getRoleBadgeStyles(row.original.role).border} text-xs`}
            >
              {formatRoleDisplay(row.original.role)}
            </Badge>
          </div>
          <span className="text-sm text-gray-500">{row.original.email}</span>
        </div>
      </div>
    </div>
    ),
  },
  { accessorKey: "designation", header: "Job Title" },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="mr-2">{row?.original.manager?.name}</div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="mr-2">{row?.original.department?.name}</div>
      </div>
    ),
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="mr-2">{row?.original.team?.name}</div>
      </div>
    ),
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-center items-center space-x-2">
        {row.original.status === "active" ? (
          <Badge className="bg-green-100 border border-green-400 text-black px-2 py-1 rounded-xl flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </Badge>
        ) : row.original.status === "pending" ? (
          <Badge className="bg-yellow-100 border border-yellow-500 text-black px-2 py-1 rounded-xl flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Pending</span>
          </Badge>
        ) : (
          <Badge className="bg-gray-500 text-white px-2 py-1 rounded-lg text-center">
            {row.original.status}
          </Badge>
        )}
      </div>
    ),
  },
];

function Page() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchText, setSearchText] = useState("");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const [totalEmployee, setTotalEmployee] = useState<number>(0);
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1); // Track current page
  const debouncedPage = useDebounce(currentPage, 300);
   const debouncedSearch = useDebounce(searchText, 500);

  const fetchUserData = async () => {
    const response = await axios.get(`${backendUrl}/users?pageNo=${currentPage}&search=${debouncedSearch}`, {
      headers: {
        Authorization: `Bearer ${session?.user?.token}`,
      },
    });

    return response.data.data;
  };

  const { data: userData = [], isLoading = true, isError } = useQuery({
    queryKey: ["users", debouncedPage,debouncedSearch],
    enabled: status === "authenticated",
    queryFn: fetchUserData,
  });

  useEffect(() => {
    if (userData?.pagination) {
      setTotalEmployee(userData.pagination.totalItems);
      setPaginationPages(userData.pagination.totalPages);
    }
  }, [userData]);
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [currentPage, queryClient]);


  const table = useReactTable({
    data: userData.data || [],
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    setColumnFilters([
      {
        id: "name",
        value: value.trim().toLowerCase(),
      },
    ]);
  };

  return (
    <>

      <div className="w-full px-4">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center">
            <div className="w-7 m-2 h-7 rounded-full bg-[#45AEA9] flex items-center justify-center text-white">
              {/* {Array.isArray(userData.data) ? userData.data.length : 0} */}{totalEmployee}
            </div>
            <p className="ml-2 text-slate-600 font-bold">Employees</p>
          </div>


          <div className="flex items-center gap-2">
            <Image src={filter} alt="filter" className="w-20 h-9 " />
            <Image src={sort} alt="sorting" className="w-20 h-9 " />
            <SearchInput
              className="rounded-2xl"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
            
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
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell >
                      <div className="h-6 w-12 bg-gray-300 rounded-md animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="h-6 w-32 bg-gray-300 rounded-md animate-pulse"></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="h-6 w-20 bg-gray-300 rounded-md animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="h-6 w-12 bg-gray-300 rounded-md animate-pulse"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-24 bg-gray-300 rounded-md animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-24 bg-gray-300 rounded-md animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel() && table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
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
