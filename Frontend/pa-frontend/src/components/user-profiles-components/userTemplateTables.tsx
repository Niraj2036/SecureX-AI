import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  RefreshCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import DisabledRatingSlider from "../DisabledRating";
import { Input } from "../ui/input";
import Link from "next/link";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";

interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface FormResponse {
  id: string;
  template: {
    id: string;
    name: string;
    type: string;
    status: string;
    createdAt: string;
    categories?: any[];
  };
  user: User;
  status: string;
  createdAt: string;
  isManager: boolean;
}

interface UserTemplateTablesProps {
  user: User;
  type: string;
}
const typeLabels: Record<string, string> = {
  checkIn: "Check-in",
  oneOnOne: "1 on 1",
  performance: "Performance",
};

const UserTemplateTables = ({ user, type }: UserTemplateTablesProps) => {
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const params = useSearchParams();
  const userId = params.get("id");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>();
  const { userDetails } = useSessionStore((state) => state);
  const [status, setStatus] = useState<string>("pending");
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);

  const {
    data: formData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "formData",
      userId,
      status,
      type,
      selectedDateFilter,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      const response = await axios.post(
        `${backendUrl}/form-response/getFormByUserId`,
        {
          userId: userId,
          status: status,
          type: type,
          dateFilter: selectedDateFilter,
          pageNo: currentPage.toString(),
          pageSize: pageSize,
        },
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.token,
  });

  useEffect(() => {
    refetch();
  }, [status, selectedDateFilter, currentPage, pageSize, refetch]);

  const FormResponseMutation = useMutation({
    mutationFn: async (formId: string) => {
      const response = await axios.get(
        `${backendUrl}/form-response/${formId}`,
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: (response: any) => {
      setSelectedResponse(response.data);
    },
    onError: (error: any) => {
      console.error("Error fetching form response:", error);
    },
  });

  const onPageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  const handleShowResponse = async (formId: string) => {
    try {
      await FormResponseMutation.mutateAsync(formId);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const dateFilters = {
    today: "Today",
    yesterday: "Yesterday",
    last7days: "Last 7 Days",
    last15days: "Last 15 Days",
    last30days: "Last 30 Days",
    last3months: "Last 3 Months",
    last6months: "Last 6 Months",
  };

  const statusFilters = {
    pending: "Pending",
    completed: "Completed",
    not_verified: "Approve Pending",
  };

  const resetFilter = () => {
    setSelectedDateFilter(undefined);
    setStatus("pending");
    setCurrentPage(1);
    setPageSize(10);
    refetch();
  };
  const types: Record<string, string> = {
    checkIn: "Check-In",
    oneOnOne: "1 on 1",
    performance: "Performance",
  };

  const sendReminderMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      templateId: string;
      formResId: string;
    }) => {
      const response = await axios.post(
        `${backendUrl}/notification/sendReminder`,
        data,
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent Successfully",
        description: "Reminder Sent Successfully",
        duration: 3000,
      });
      setLoadingButtonId(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Error in sending reminder";
      const timeLeft = error.response?.data?.timeLeft;
      toast({
        title: "Reminder Not Sent",
        description: timeLeft ? `${message} (${timeLeft})` : message,
        duration: 4000,
        variant: "destructive",
      });
      setLoadingButtonId(null);
    },
  });
  const handleSendReminder = (
    userId: string,
    templateId: string,
    formResId: string
  ) => {
    setLoadingButtonId(formResId);
    sendReminderMutation.mutate({
      userId,
      templateId,
      formResId,
    });
  };

  const FormDeclineMutation = useMutation({
    mutationFn: async (formResId: string) => {
      const response = await axios.post(
        `${backendUrl}/form-response/decline/${formResId}`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Form Declined",
        description: "The form has been sent back for corrections",
        duration: 3000,
      });
      refetch();
      setSelectedResponse(null);
    },
    onError: (error: any) => {
      toast({
        title: "Decline Failed",
        description: error.response?.data?.message || "Failed to decline form",
        duration: 3000,
        variant: "destructive",
      });
    },
  });

  const FormApproveMutation = useMutation({
    mutationFn: async (formResId: string) => {
      const response = await axios.post(
        `${backendUrl}/form-response/approve/${formResId}`,
        {},
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Form Approved",
        description: "The form has been approved successfully",
        duration: 3000,
      });
      refetch();
      setSelectedResponse(null);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Failed to approve form",
        duration: 3000,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-4">
      {/* Title and Filters in one row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-black font-bold py-2 text-lg">
          {typeLabels[type]}
        </h1>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Select
            value={selectedDateFilter}
            onValueChange={setSelectedDateFilter}
          >
            <SelectTrigger className="w-48 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <SelectValue placeholder="Filter by Date" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(dateFilters).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 flex items-center gap-2">
              <ChartNoAxesColumn className="w-4 h-4 text-gray-500" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusFilters).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={resetFilter}
            variant="outline"
            className="flex bg-neutral-100 items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader className="bg-neutral-100 text-sm">
            <TableRow>
              <TableHead>Template Name</TableHead>
              {status === "completed" ? (
                <TableHead>Filled By</TableHead>
              ) : (
                <TableHead>Assigned To</TableHead>
              )}
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div
                        className="h-4 bg-neutral-200 rounded-md"
                        style={{ width: `${Math.random() * 100 + 50}px` }}
                      ></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-red-500 py-4"
                >
                  Failed to load data
                </TableCell>
              </TableRow>
            ) : formData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-40 h-40">
                      <svg
                        className="w-full h-full text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                      {/* <div className="absolute inset-0 flex items-center justify-center">
                                                <svg
                                                    className="w-20 h-20 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1}
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                    />
                                                </svg>
                                            </div> */}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-medium text-gray-700">
                        No forms found
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        {status === "completed"
                          ? "There are no completed forms to display. Check back later or assign new forms."
                          : "You don't have any pending forms. Enjoy your day!"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              formData?.data?.map((item: FormResponse) => (
                <TableRow key={item.id}>
                  <TableCell>{item.template.name}</TableCell>
                  <TableCell>{item.user.name}</TableCell>
                  <TableCell>
                    <Badge>
                      {types[item?.template?.type] ||
                        item?.template?.type ||
                        "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "completed"
                          ? "bg-blue-100 border border-blue-500 hover:bg-blue-100 text-blue-800 px-2 py-1 rounded-xl  space-x-2"
                          : item.status === "pending"
                          ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1 rounded-xl  space-x-2"
                          : item.status === "not_verified"
                          ? "bg-red-100 hover:bg-red-100 text-red-800 border border-red-300 px-2 py-1 rounded-xl  space-x-2"
                          : "bg-gray-100 text-gray-800 border border-gray-300 px-2 py-1 rounded-xl  space-x-2"
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.status === "completed"
                            ? "bg-blue-500"
                            : item.status === "pending"
                            ? "bg-yellow-500"
                            : item.status === "not_verified"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span>{item.status.replace("_", " ").toUpperCase()}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {item.status === "completed" ? (
                      <ShowFormResponse
                        item={item}
                        selectedResponse={selectedResponse}
                        setSelectedResponse={setSelectedResponse}
                        handleShowResponse={handleShowResponse}
                      />
                    ) : item.status === "not_verified" ? (
                      <ShowFormResponseWithActions
                        item={item}
                        selectedResponse={selectedResponse}
                        setSelectedResponse={setSelectedResponse}
                        handleShowResponse={handleShowResponse}
                        onApprove={() => FormApproveMutation.mutate(item.id)}
                        onDecline={() => FormDeclineMutation.mutate(item.id)}
                        isApproving={FormApproveMutation.isPending}
                        isDeclining={FormDeclineMutation.isPending}
                      />
                    ) : userDetails.id === userId ? (
                      <Button>
                        <Link
                          href={
                            item.template.type === "checkIn"
                              ? `/performance/check-ins/my-checkin/fill-up?templateId=${item.template.id}&formResId=${item.id}&username=${item.user.name}&useremail=${item.user.email}&userAvatar=${item.user.avatar}`
                              : item.template.type === "oneOnOne"
                              ? `/performance/1on1/my-checkin/fill-up?templateId=${item.template.id}&formResId=${item.id}&username=${item.user.name}&useremail=${item.user.email}&userAvatar=${item.user.avatar}`
                              : item.template.type === "performance"
                              ? `/performance/management/fillup?templateId=${item.template.id}&formResId=${item.id}&username=${item.user.name}&useremail=${item.user.email}&userAvatar=${item.user.avatar}`
                              : "#"
                          }
                        >
                          Submit
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleSendReminder(
                            userId || "",
                            item?.template?.id,
                            item.id
                          )
                        }
                        isLoading={loadingButtonId === item.id}
                      >
                        <Bell />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {formData?.pagination && (
          <div className="pt-2 my-3">
            <ReactPaginate
              previousLabel="Prev"
              nextLabel="Next"
              breakLabel="..."
              pageCount={formData.pagination.totalPages}
              forcePage={currentPage - 1}
              marginPagesDisplayed={1}
              pageRangeDisplayed={3}
              onPageChange={onPageChange}
              containerClassName="flex justify-between items-center w-[250px] mx-auto"
              pageClassName="px-3 py-2 text-black hover:text-green-800"
              activeClassName="bg-secondary-400 text-white rounded-md"
              previousClassName={`px-3 py-2 ${
                currentPage === 1
                  ? "text-gray-400"
                  : "text-black hover:text-green-800"
              }`}
              nextClassName={`px-3 py-2 ${
                currentPage === formData.pagination.totalPages
                  ? "text-gray-400"
                  : "text-black hover:text-green-800"
              }`}
              disabledClassName="text-gray-400"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

interface ShowFormResponseProps {
  item: FormResponse;
  selectedResponse: any;
  setSelectedResponse: (response: any) => void;
  handleShowResponse: (id: string) => void;
}

const ShowFormResponse = ({
  item,
  selectedResponse,
  setSelectedResponse,
  handleShowResponse,
}: ShowFormResponseProps) => {
  return (
    <Dialog
      open={!!selectedResponse}
      onOpenChange={() => setSelectedResponse(null)}
    >
      <DialogTrigger asChild>
        <Button onClick={() => handleShowResponse(item.id)}>
          Show Response
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Form Response</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-4">
            <Card className="bg-neutral-50 rounded-md shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Assignee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {item.user.avatar ? (
                      <AvatarImage
                        src={item.user.avatar}
                        alt={item.user.name || "Unknown"}
                      />
                    ) : (
                      <AvatarFallback>
                        {item.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="text-lg font-semibold text-gray-700">
                      {item.user.name || "Unknown"}
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.user.email || "No email provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-lg font-semibold">Questions and Responses:</h3>
            {selectedResponse?.template?.categories?.map((category: any) => (
              <Card key={category.id} className="my-4 bg-neutral-50 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <div className="border-t w-full"></div>
                <div className="p-4 space-y-6">
                  {category.questions.map((question: any) => (
                    <QuestionResponse key={question.id} question={question} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => setSelectedResponse(null)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface QuestionResponseProps {
  question: any;
}

const QuestionResponse = ({ question }: QuestionResponseProps) => {
  const isRequired = question.isRequired;

  switch (question.type) {
    case "rating":
      const ratingValue =
        question?.selectedResponse?.ratingResponse?.value || 0;
      return (
        <div>
          <div className="text-lg font-medium">
            {question.questionText}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <DisabledRatingSlider
            options={question.options.map((option: any) => ({
              label: option.label,
              value: option.value,
            }))}
            value={ratingValue}
          />
        </div>
      );

    case "yesNo":
      const selectedYesNo = question?.selectedResponse?.yesNoResponse;
      return (
        <div>
          <div className="text-lg font-medium">
            {question.questionText}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="mt-2 flex items-center space-x-4">
            {question.options.map((option: any) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={selectedYesNo?.id === option.id}
                  disabled
                  className="w-4 h-4 text-blue-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "descriptive":
      const textResponse = question?.selectedResponse?.textResponse || "";
      return (
        <div>
          <div className="text-lg font-medium">
            {question.questionText}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md mt-2 bg-gray-100"
            value={textResponse}
            disabled
            rows={4}
          />
        </div>
      );

    case "multipleChoice":
      const selectedMsq = question?.selectedResponse?.msqResponse;
      return (
        <div>
          <div className="text-lg font-medium">
            {question.questionText}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </div>
          <div className="mt-2 space-y-2">
            {question.options.map((option: any) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={selectedMsq?.id === option.id}
                  disabled
                  className="w-4 h-4 text-blue-500"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default UserTemplateTables;
interface ShowFormResponseWithActionsProps extends ShowFormResponseProps {
  onApprove: () => void;
  onDecline: () => void;
  isApproving: boolean;
  isDeclining: boolean;
}

const ShowFormResponseWithActions = ({
  item,
  selectedResponse,
  setSelectedResponse,
  handleShowResponse,
  onApprove,
  onDecline,
  isApproving,
  isDeclining,
}: ShowFormResponseWithActionsProps) => {
  return (
    <Dialog
      open={!!selectedResponse}
      onOpenChange={() => setSelectedResponse(null)}
    >
      <DialogTrigger asChild>
        <Button onClick={() => handleShowResponse(item.id)}>
          Show Response
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Form Response - Approval Required</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDecline} disabled={isDeclining}>
            {isDeclining ? "Declining..." : "Decline"}
          </Button>
          <Button onClick={onApprove} disabled={isApproving}>
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

