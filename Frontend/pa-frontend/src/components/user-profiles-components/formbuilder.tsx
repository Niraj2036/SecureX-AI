"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounce } from "../ui/multiselect";
import ReactPaginate from "react-paginate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CalendarDays, FileSearch, RefreshCcw, User, Users } from "lucide-react";
import useSessionStore from "@/store/sessionStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function FormBuilder({ from, type, filled }: { from: string, type: string, filled: boolean }) {
  const { data: userSession } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [paginationPages, setPaginationPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const debouncedPage = useDebounce(currentPage, 300);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>();
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | undefined>();
  const { userRole,session } = useSessionStore((state) => state);

  const { data: formData, isLoading, isError } = useQuery({
    queryKey: ["formData", debouncedPage, selectedUser, selectedTeam, selectedDateFilter,session?.id],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/form-response`, {
        params: {
          type,
          pageNo: debouncedPage,
          userId: selectedUser,
          teamId: selectedTeam,
          dateFilter: selectedDateFilter,
          sessionId: session?.id,
        },
        headers: { Authorization: `Bearer ${userSession?.user.token}` },
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (formData?.data?.paginationMetadata) {
      setPaginationPages(formData?.data?.paginationMetadata.totalPages);
    }
  }, [formData]);
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["formData"] });
  }, [currentPage, queryClient]);


  const FormType = filled ? "toView" : "toFill";

  const onPageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const types: Record<string, string> = {
    checkIn: "Check-In",
    oneOnOne: "1 on 1",
    performance: "Performance",
  };

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/owners`, {
        headers: {
          Authorization: `Bearer ${userSession?.user.token}`,
        },
      });
      return response.data;
    },
  });

  const resetFilter = () => {
    setSelectedUser(undefined);
    setSelectedTeam(undefined);
    setSelectedDateFilter(undefined);
    setCurrentPage(1);
  };

  const dateFilters = {
    today: "Today",
    yesterday: "Yesterday",
    last7days: "Last 7 Days",
    last30days: "Last 30 Days",
    last3months: "Last 3 Months",
    last6months: "Last 6 Months"
  };

  return (
    <>
      <div className="flex justify-end pb-2 mr-2 items-center">
        <div className="flex gap-4">
          {userRole && userRole !== "employee"  && (
            <>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-48 flex items-center gap-2 hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-colors shadow-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Filter by User" />
                </SelectTrigger>
                <SelectContent side="top">
                  {allUsers?.data?.users?.map((user: any) => (
                    <SelectItem key={user?.id} value={user?.id}>
                      {user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48 flex items-center gap-2 hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-colors shadow-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Filter by Team" />
                </SelectTrigger>
                <SelectContent side="top">
                  {allUsers?.data?.teams?.map((team: any) => (
                    <SelectItem key={team?.id} value={team?.id}>
                      {team?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {/* {JSON.stringify()} */}
          <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
            <SelectTrigger className="w-48 flex items-center gap-2 hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-colors shadow-sm">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <SelectValue placeholder="Filter by Date" />
            </SelectTrigger>
            <SelectContent side="top">
              {Object.entries(dateFilters).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          <Button onClick={resetFilter} variant="outline" className="flex bg-neutral-100 items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-gray-500" />
            {/* Reset Filters */}
          </Button>

        </div>
      </div>
      <Card className="ml-2 mr-2">
        <Table>
          <TableHeader className="bg-neutral-100 text-sm">
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead >For</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-left">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 w-32 bg-neutral-200 rounded-md"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-neutral-200 rounded-md"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 bg-neutral-200 rounded-md"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 bg-neutral-200 rounded-md"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 bg-neutral-200 rounded-md"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-20 bg-neutral-200 rounded-md"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : formData?.data?.toFill?.length > 0 ? (
              formData.data.toFill.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item?.template?.name}
                    {/* <Badge className={item?.isManager ? "bg-orange-500 text-white ml-2" : "bg-green-500 text-white ml-2"}>
                      {item?.isManager ? "Manager" : "Employee"}
                    </Badge> */}
                  </TableCell>
                  <TableCell> <Link href={`/user-profiles?id=${item?.user?.id}`} className="hover:text-blue-500 flex " passHref>
                    <Avatar className="mr-2">
                      <AvatarImage
                        src={item?.user?.avatar || undefined}
                        alt={`${item?.user?.name}'s avatar`}
                        className="hover:opacity-20"
                      />
                      <AvatarFallback className="hover:opacity-20">
                        {item?.user?.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ">
                      <span>{item?.user?.name}</span>
                      <span>{item?.user?.email}</span>
                    </div>
                  </Link></TableCell>
                  <TableCell><Badge>{types[item?.template?.type] || item?.template?.type || "Unknown"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item?.template?.status === "active" ? (
                        <Badge className="bg-green-100 border hover:bg-green-100 border-green-400 text-black px-2 py-1 rounded-xl flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Active</span>
                        </Badge>
                      ) : item?.template?.status === "inactive" ? (
                        <Badge className="bg-yellow-100 border hover:bg-yellow-100 border-yellow-500 text-black px-2 py-1 rounded-xl flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Inactive</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500 text-white px-2 py-1 rounded-lg text-center">
                          {item?.template?.status}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(item?.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {FormType !== "toView" ? (
                      <Button>
                        <Link
                          href={
                            from === "profile"
                              ? "my-checkin/fill-up?templateId=" + item?.template?.id +
                              "&formResId=" + item?.id +
                              "&username=" + item?.user?.name +
                              "&useremail=" + item?.user?.email +
                              "&userAvatar=" + item?.user?.avatar +
                              "&userId=" + item?.user?.id
                              : from === "performance"
                                ? "/performance/management/fillup?templateId=" + item?.template?.id +
                                "&formResId=" + item?.id +
                                "&username=" + item?.user?.name +
                                "&useremail=" + item?.user?.email +
                                "&userAvatar=" + item?.user?.avatar +
                                "&userId=" + item?.user?.id
                                : "performance/check-ins/my-checkin/fill-up?templateId=" + item?.template?.id +
                                "&formResId=" + item?.id +
                                "&username=" + item?.user?.name +
                                "&useremail=" + item?.user?.email +
                                "&userAvatar=" + item?.user?.avatar +
                                "&userId=" + item?.user?.id
                          }
                        >
                          Submit
                        </Link>
                      </Button>
                    ) : (
                      <TableCell />
                    )}
                  </TableCell>
                </TableRow>
              ))

            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <FileSearch className="w-12 h-12 text-gray-400" />
                    <div className="text-lg font-medium text-gray-500">
                      {` No ${types[type]}  found`}
                    </div>
                    <p className="text-gray-400 max-w-md text-center">
                      {FormType === "toView"
                        ? "There are no forms to view at the moment."
                        : "There are no templates available right now. Chill for a bit or check back later — something cool might pop up!"}
                      {/* `You don't have any ${types[type]} review to fill out right now. Check back later!` */}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
        <div className="pt-2 my-3">
          <ReactPaginate
            previousLabel="Prev"
            nextLabel="Next"
            breakLabel="..."
            pageCount={paginationPages}
            forcePage={currentPage - 1}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={(selectedItem) => onPageChange(selectedItem)}
            containerClassName="flex justify-between items-center w-[250px] mx-auto"
            pageClassName="px-3 py-2 text-black hover:text-green-800"
            activeClassName="bg-secondary-400 text-white rounded-md"
            previousClassName={`px-3 py-2 ${currentPage === 1 ? "text-gray-400" : "text-black hover:text-green-800"}`}
            nextClassName={`px-3 py-2 ${currentPage === paginationPages ? "text-gray-400" : "text-black hover:text-green-800"}`}
            disabledClassName="text-gray-400"
          />
        </div>
      </Card>
    </>
  );
}
