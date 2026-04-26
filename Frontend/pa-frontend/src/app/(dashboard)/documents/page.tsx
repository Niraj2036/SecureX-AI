"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchInput from "@/components/ui/serach-input";
import { useDebounce } from "@/components/ui/multiselect";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  X,
  CloudUpload,
  FileUp,
  Users,
  Building2,
  UserCircle,
  Check,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

// ============ Types ============
interface Document {
  id: string;
  title: string;
  description: string | null;
  type: string;
  fileUrl: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  employeeId: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; name: string; email: string; avatar?: string };
  employee: { id: string; name: string; email: string } | null;
  access: AccessEntry[];
}

interface AccessEntry {
  id: string;
  targetType: "user" | "team" | "department";
  userId: string | null;
  teamId: string | null;
  permission: "view" | "download" | "manage";
  user: { id: string; name: string; email: string } | null;
  team: { id: string; name: string; type: string } | null;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface TeamOption {
  id: string;
  name: string;
  type: string;
}

// ============ Constants ============
const DOCUMENT_TYPES = [
  { value: "offer_letter", label: "Offer Letter" },
  { value: "id_proof", label: "ID Proof" },
  { value: "policy", label: "Policy" },
  { value: "nda", label: "NDA" },
  { value: "contract", label: "Contract" },
  { value: "payslip", label: "Payslip" },
  { value: "other", label: "Other" },
];

const PERMISSIONS = [
  { value: "view", label: "View" },
  { value: "download", label: "Download" },
  { value: "manage", label: "Manage" },
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getTypeBadgeColor = (type: string) => {
  const colors: Record<string, string> = {
    offer_letter: "bg-emerald-100 text-emerald-800 border-emerald-300",
    id_proof: "bg-blue-100 text-blue-800 border-blue-300",
    policy: "bg-purple-100 text-purple-800 border-purple-300",
    nda: "bg-red-100 text-red-800 border-red-300",
    contract: "bg-amber-100 text-amber-800 border-amber-300",
    payslip: "bg-cyan-100 text-cyan-800 border-cyan-300",
    other: "bg-gray-100 text-gray-800 border-gray-300",
  };
  return colors[type] || colors.other;
};

const formatType = (type: string) =>
  type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// ============ Access Control Picker Component ============
function AccessControlPicker({
  selectedAccess,
  setSelectedAccess,
  users,
  teams,
}: {
  selectedAccess: Array<{
    targetType: "user" | "team" | "department";
    userId?: string;
    teamId?: string;
    permission: "view" | "download" | "manage";
    label: string;
  }>;
  setSelectedAccess: React.Dispatch<React.SetStateAction<any[]>>;
  users: UserOption[];
  teams: TeamOption[];
}) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedPermission, setSelectedPermission] = useState<"view" | "download" | "manage">("view");

  // Separate teams and departments
  const teamsList = teams.filter((t) => t.type === "team");
  const deptList = teams.filter((t) => t.type === "department");

  // Get already selected IDs
  const selectedUserIds = selectedAccess.filter((a) => a.targetType === "user").map((a) => a.userId);
  const selectedTeamIds = selectedAccess.filter((a) => a.targetType === "team").map((a) => a.teamId);
  const selectedDeptIds = selectedAccess.filter((a) => a.targetType === "department").map((a) => a.teamId);

  const addUserAccess = () => {
    if (!selectedUser) return;
    const user = users.find((u) => u.id === selectedUser);
    if (user && !selectedUserIds.includes(user.id)) {
      setSelectedAccess((prev) => [
        ...prev,
        {
          targetType: "user",
          userId: user.id,
          permission: selectedPermission,
          label: user.name,
        },
      ]);
      setSelectedUser("");
    }
  };

  const addTeamAccess = () => {
    if (!selectedTeam) return;
    const team = teamsList.find((t) => t.id === selectedTeam);
    if (team && !selectedTeamIds.includes(team.id)) {
      setSelectedAccess((prev) => [
        ...prev,
        {
          targetType: "team",
          teamId: team.id,
          permission: selectedPermission,
          label: team.name,
        },
      ]);
      setSelectedTeam("");
    }
  };

  const addDeptAccess = () => {
    if (!selectedDept) return;
    const dept = deptList.find((d) => d.id === selectedDept);
    if (dept && !selectedDeptIds.includes(dept.id)) {
      setSelectedAccess((prev) => [
        ...prev,
        {
          targetType: "department",
          teamId: dept.id,
          permission: selectedPermission,
          label: dept.name,
        },
      ]);
      setSelectedDept("");
    }
  };

  const removeAccess = (index: number) => {
    setSelectedAccess((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePermission = (index: number, permission: "view" | "download" | "manage") => {
    setSelectedAccess((prev) =>
      prev.map((a, i) => (i === index ? { ...a, permission } : a))
    );
  };

  return (
    <div className="space-y-4">

      {/* Users Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-600 block">Add User Access</label>
        <div className="flex gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="flex-1 h-9">
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((u) => !selectedUserIds.includes(u.id))
                .map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            onClick={addUserAccess}
            disabled={!selectedUser}
            className="bg-[#45AEA9] hover:bg-[#3a9994]"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Teams Dropdown */}
      {teamsList.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">Add Team Access</label>
          <div className="flex gap-2">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder="Select a team..." />
              </SelectTrigger>
              <SelectContent>
                {teamsList
                  .filter((t) => !selectedTeamIds.includes(t.id))
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{t.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              onClick={addTeamAccess}
              disabled={!selectedTeam}
              className="bg-[#45AEA9] hover:bg-[#3a9994]"
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Departments Dropdown */}
      {deptList.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">Add Department Access</label>
          <div className="flex gap-2">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="flex-1 h-9">
                <SelectValue placeholder="Select a department..." />
              </SelectTrigger>
              <SelectContent>
                {deptList
                  .filter((d) => !selectedDeptIds.includes(d.id))
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{d.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              onClick={addDeptAccess}
              disabled={!selectedDept}
              className="bg-[#45AEA9] hover:bg-[#3a9994]"
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Global Permission Selector */}
      {selectedAccess.length === 0 ? null : (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600 block">Default Permission</label>
          <Select value={selectedPermission} onValueChange={(v) => setSelectedPermission(v as any)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERMISSIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected Access Entries */}
      {selectedAccess.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium text-slate-600">
            Selected Access ({selectedAccess.length})
          </p>
          <div className="space-y-2">
            {selectedAccess.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-2 flex-1">
                  {entry.targetType === "user" ? (
                    <UserCircle className="h-4 w-4 text-blue-500" />
                  ) : entry.targetType === "team" ? (
                    <Users className="h-4 w-4 text-green-500" />
                  ) : (
                    <Building2 className="h-4 w-4 text-purple-500" />
                  )}
                  <span className="text-sm font-medium flex-1">{entry.label}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {entry.targetType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={entry.permission}
                    onValueChange={(val) =>
                      updatePermission(idx, val as "view" | "download" | "manage")
                    }
                  >
                    <SelectTrigger className="h-7 w-[90px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value} className="text-xs">
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => removeAccess(idx)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Drag & Drop Zone ============
function DropZone({
  onFilesSelected,
  multiple = false,
  files,
  onRemoveFile,
}: {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  files: File[];
  onRemoveFile?: (index: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (!multiple && droppedFiles.length > 1) {
        onFilesSelected([droppedFiles[0]]);
      } else {
        onFilesSelected(droppedFiles.slice(0, 10));
      }
    },
    [multiple, onFilesSelected]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    onFilesSelected(multiple ? selectedFiles.slice(0, 10) : [selectedFiles[0]]);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-[#45AEA9] bg-[#45AEA9]/5 scale-[1.01]"
            : "border-slate-300 hover:border-[#45AEA9] hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept=".pdf,.doc,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
          onChange={handleInputChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`p-3 rounded-full transition-colors ${
              isDragging ? "bg-[#45AEA9]/10" : "bg-slate-100"
            }`}
          >
            <CloudUpload
              className={`h-8 w-8 ${isDragging ? "text-[#45AEA9]" : "text-slate-400"}`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              or{" "}
              <span className="text-[#45AEA9] font-medium">browse files</span>
              {" · "}PDF, DOC, DOCX, XLSX, CSV, TXT, PNG, JPG · Max 10MB
            </p>
          </div>
        </div>
      </div>

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#45AEA9]" />
                <div>
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[300px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Main Page ============
export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const queryClient = useQueryClient();

  // List state
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchText, 500);
  const debouncedPage = useDebounce(currentPage, 300);

  // Single Upload state
  const [singleFile, setSingleFile] = useState<File[]>([]);
  const [singleTitle, setSingleTitle] = useState("");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleType, setSingleType] = useState("other");
  const [singleEmployeeId, setSingleEmployeeId] = useState("");
  const [singleAccess, setSingleAccess] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Bulk Upload state
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkType, setBulkType] = useState("other");
  const [bulkAccess, setBulkAccess] = useState<any[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState<{
    success: any[];
    failed: any[];
  } | null>(null);

  // Detail dialog
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Delete dialog
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Fetch Documents ----
  const { data: documentsData, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", debouncedPage, debouncedSearch, typeFilter],
    enabled: status === "authenticated",
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
      });
      const res = await axios.get(`${backendUrl}/documents?${params}`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return res.data.data;
    },
  });

  // ---- Fetch Users & Teams for Access Picker ----
  const { data: usersForAccess = [] } = useQuery({
    queryKey: ["usersForAccess"],
    enabled: status === "authenticated",
    queryFn: async () => {
      const res = await axios.get(`${backendUrl}/users?pageNo=1&limit=200`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return res.data.data?.data || [];
    },
  });

  const { data: teamsForAccess = [] } = useQuery({
    queryKey: ["teamsForAccess"],
    enabled: status === "authenticated",
    queryFn: async () => {
      try {
        // Fetch both teams and departments
        const [teamsRes, deptsRes] = await Promise.all([
          axios.get(`${backendUrl}/teams?pageNo=1&pageSize=500`, {
            headers: { Authorization: `Bearer ${session?.user?.token}` },
          }),
          axios.get(`${backendUrl}/teams/dept?pageNo=1&pageSize=500`, {
            headers: { Authorization: `Bearer ${session?.user?.token}` },
          }),
        ]);

        const teams = (teamsRes.data.data?.data || teamsRes.data.data || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          type: "team",
        }));

        const departments = (deptsRes.data.data?.data || deptsRes.data.data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          type: "department",
        }));

        return [...teams, ...departments];
      } catch (error) {
        console.error("Error fetching teams and departments:", error);
        return [];
      }
    },
  });

  // ---- Single Upload Handler ----
  const handleSingleUpload = async () => {
    if (!singleFile[0] || !singleTitle.trim()) {
      toast({ title: "Error", description: "File and title are required", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", singleFile[0]);
      formData.append("title", singleTitle);
      formData.append("description", singleDescription);
      formData.append("type", singleType);
      if (singleEmployeeId) formData.append("employeeId", singleEmployeeId);
      formData.append(
        "access",
        JSON.stringify(
          singleAccess.map((a) => ({
            targetType: a.targetType,
            userId: a.userId,
            teamId: a.teamId,
            permission: a.permission,
          }))
        )
      );

      await axios.post(`${backendUrl}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({ title: "Success", description: "Document uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      // Reset form
      setSingleFile([]);
      setSingleTitle("");
      setSingleDescription("");
      setSingleType("other");
      setSingleEmployeeId("");
      setSingleAccess([]);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ---- Bulk Upload Handler ----
  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) {
      toast({ title: "Error", description: "Select at least one file", variant: "destructive" });
      return;
    }
    setIsBulkUploading(true);
    setBulkResults(null);
    try {
      const formData = new FormData();
      bulkFiles.forEach((f) => formData.append("files", f));

      const metadata = bulkFiles.map((f) => ({
        title: f.name.replace(/\.[^/.]+$/, ""),
        type: bulkType,
        access: bulkAccess.map((a) => ({
          targetType: a.targetType,
          userId: a.userId,
          teamId: a.teamId,
          permission: a.permission,
        })),
      }));
      formData.append("metadata", JSON.stringify(metadata));

      const res = await axios.post(`${backendUrl}/documents/upload-bulk`, formData, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setBulkResults(res.data.data);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Bulk upload complete",
        description: `${res.data.data.success.length} succeeded, ${res.data.data.failed.length} failed`,
      });
      setBulkFiles([]);
    } catch (error: any) {
      toast({
        title: "Bulk upload failed",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  // ---- Delete Handler ----
  const handleDelete = async () => {
    if (!deleteDocId) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/documents/${deleteDocId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      toast({ title: "Deleted", description: "Document deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteDocId(null);
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ---- Table Columns ----
  const columns: ColumnDef<Document>[] = [
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
      accessorKey: "title",
      header: "Document",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <FileText className="h-4 w-4 text-[#45AEA9]" />
          </div>
          <div>
            <p className="font-medium text-slate-700">{row.original.title}</p>
            <p className="text-xs text-slate-400">{row.original.fileName}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          className={`${getTypeBadgeColor(row.original.type)} border text-xs`}
        >
          {formatType(row.original.type)}
        </Badge>
      ),
    },
    {
      accessorKey: "uploadedBy",
      header: "Uploaded By",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={row.original.uploadedBy?.avatar} />
            <AvatarFallback className="text-xs bg-slate-200">
              {row.original.uploadedBy?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{row.original.uploadedBy?.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {row.original.employee?.name || "—"}
        </span>
      ),
    },
    {
      accessorKey: "fileSize",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatFileSize(row.original.fileSize)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: "access",
      header: "Access",
      cell: ({ row }) => {
        const count = row.original.access?.length || 0;
        return (
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            {count} {count === 1 ? "entry" : "entries"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDoc(row.original);
              setShowDetail(true);
            }}
          >
            <Eye className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              window.open(row.original.fileUrl, "_blank");
            }}
          >
            <Download className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDocId(row.original.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  // ---- Table Setup ----
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: documentsData?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const totalDocs = documentsData?.pagination?.totalItems || 0;
  const totalPages = documentsData?.pagination?.totalPages || 1;

  return (
    <div className="w-full px-4 py-6">
      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#45AEA9]/10 rounded-lg">
              <FileText className="h-5 w-5 text-[#45AEA9]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Document Management</h1>
              <p className="text-sm text-slate-500">Upload, manage and control access to documents</p>
            </div>
          </div>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="list" className="data-[state=active]:bg-white">
              <FileText className="h-4 w-4 mr-1.5" /> All Documents
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-white">
              <Upload className="h-4 w-4 mr-1.5" /> Single Upload
            </TabsTrigger>
            <TabsTrigger value="bulk" className="data-[state=active]:bg-white">
              <FileUp className="h-4 w-4 mr-1.5" /> Bulk Upload
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ================ TAB 1: DOCUMENT LIST ================ */}
        <TabsContent value="list">
          <div className="space-y-4">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#45AEA9] flex items-center justify-center text-white text-sm font-medium">
                  {totalDocs}
                </div>
                <p className="text-slate-600 font-bold">Documents</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {DOCUMENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SearchInput
                  className="rounded-2xl"
                  value={searchText}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {docsLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 9 }).map((_, ci) => (
                          <TableCell key={ci}>
                            <div className="h-6 w-full bg-gray-200 rounded-md animate-pulse" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => {
                          setSelectedDoc(row.original);
                          setShowDetail(true);
                        }}
                      >
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
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-slate-300" />
                          <p className="text-slate-500">No documents found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="pt-2 my-3">
              <Pagination>
                <PaginationContent className="flex justify-between items-center w-full">
                  <PaginationItem>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 ${currentPage === 1 ? "text-gray-400" : "text-black hover:text-[#45AEA9]"}`}
                    >
                      Prev
                    </button>
                  </PaginationItem>
                  <div className="flex gap-2">
                    {totalPages > 0 &&
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 ${
                              currentPage === page
                                ? "bg-[#45AEA9] text-white rounded-md"
                                : "text-black hover:text-[#45AEA9]"
                            }`}
                          >
                            {page}
                          </button>
                        </PaginationItem>
                      ))}
                  </div>
                  <PaginationItem>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 ${currentPage === totalPages ? "text-gray-400" : "text-black hover:text-[#45AEA9]"}`}
                    >
                      Next
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </TabsContent>

        {/* ================ TAB 2: SINGLE UPLOAD ================ */}
        <TabsContent value="upload">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Upload className="h-5 w-5 text-[#45AEA9]" />
                <h2 className="text-lg font-semibold text-slate-800">Upload Document</h2>
              </div>

              {/* Drop zone */}
              <DropZone
                onFilesSelected={(files) => setSingleFile(files)}
                files={singleFile}
                onRemoveFile={() => setSingleFile([])}
              />

              {/* Form Fields */}
              <div className="space-y-5 pt-2 border-t">
                <h3 className="text-sm font-semibold text-slate-700">Document Information</h3>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Document title"
                    value={singleTitle}
                    onChange={(e) => setSingleTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">
                    Description
                  </label>
                  <Input
                    placeholder="Optional description"
                    value={singleDescription}
                    onChange={(e) => setSingleDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Document Type
                    </label>
                    <Select value={singleType} onValueChange={setSingleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Associated Employee
                    </label>
                    <Select value={singleEmployeeId} onValueChange={setSingleEmployeeId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersForAccess.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Access Control Section */}
                <div className="border-t pt-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#45AEA9]" />
                    Access Control
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Choose which users, teams, or departments can access this document and what they can do with it.
                  </p>
                  <AccessControlPicker
                    selectedAccess={singleAccess}
                    setSelectedAccess={setSingleAccess}
                    users={usersForAccess}
                    teams={teamsForAccess}
                  />
                </div>
              </div>

              <Button
                onClick={handleSingleUpload}
                disabled={isUploading || !singleFile[0] || !singleTitle.trim()}
                className="w-full bg-[#45AEA9] hover:bg-[#3a9994] text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" /> Upload Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ================ TAB 3: BULK UPLOAD ================ */}
        <TabsContent value="bulk">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileUp className="h-5 w-5 text-[#45AEA9]" />
                <h2 className="text-lg font-semibold text-slate-800">Bulk Upload</h2>
                <Badge variant="outline" className="ml-auto text-xs">
                  Max 10 files
                </Badge>
              </div>

              {/* Multi Drop zone */}
              <DropZone
                multiple
                onFilesSelected={(files) =>
                  setBulkFiles((prev) => [...prev, ...files].slice(0, 10))
                }
                files={bulkFiles}
                onRemoveFile={(idx) =>
                  setBulkFiles((prev) => prev.filter((_, i) => i !== idx))
                }
              />

              {bulkFiles.length > 0 && (
                <div className="space-y-6 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1.5">
                      Document Type <span className="text-gray-400">(applied to all files)</span>
                    </label>
                    <Select value={bulkType} onValueChange={setBulkType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#45AEA9]" />
                      Access Control <span className="text-gray-400 font-normal">(applied to all files)</span>
                    </h3>
                    <AccessControlPicker
                      selectedAccess={bulkAccess}
                      setSelectedAccess={setBulkAccess}
                      users={usersForAccess}
                      teams={teamsForAccess}
                    />
                  </div>
                </div>
              )}

              {/* Results */}
              {bulkResults && (
                <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                  <h3 className="text-sm font-semibold text-slate-700">Upload Results</h3>
                  {bulkResults.success.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Check className="h-4 w-4" />
                      <span>{bulkResults.success.length} file(s) uploaded successfully</span>
                    </div>
                  )}
                  {bulkResults.failed.length > 0 && (
                    <div className="space-y-1">
                      {bulkResults.failed.map((f: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            {f.fileName}: {f.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleBulkUpload}
                disabled={isBulkUploading || bulkFiles.length === 0}
                className="w-full bg-[#45AEA9] hover:bg-[#3a9994] text-white"
              >
                {isBulkUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading {bulkFiles.length} files...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 mr-2" /> Upload {bulkFiles.length} File(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ================ DOCUMENT DETAIL DIALOG ================ */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>View document information and access control</DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg border">
                  <FileText className="h-5 w-5 text-[#45AEA9]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{selectedDoc.title}</p>
                  <p className="text-xs text-slate-400">{selectedDoc.fileName} · {formatFileSize(selectedDoc.fileSize)}</p>
                </div>
                <Badge className={`${getTypeBadgeColor(selectedDoc.type)} border text-xs`}>
                  {formatType(selectedDoc.type)}
                </Badge>
              </div>

              {selectedDoc.description && (
                <p className="text-sm text-slate-600">{selectedDoc.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">Uploaded By</span>
                  <p className="font-medium">{selectedDoc.uploadedBy?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Date</span>
                  <p className="font-medium">{formatDate(selectedDoc.createdAt)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Employee</span>
                  <p className="font-medium">{selectedDoc.employee?.name || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-400">MIME Type</span>
                  <p className="font-medium text-xs">{selectedDoc.mimeType}</p>
                </div>
              </div>

              {/* Access List */}
              {selectedDoc.access && selectedDoc.access.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" /> Access Control
                  </h4>
                  <div className="space-y-1">
                    {selectedDoc.access.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {entry.targetType === "user" ? (
                            <UserCircle className="h-4 w-4 text-blue-500" />
                          ) : entry.targetType === "team" ? (
                            <Users className="h-4 w-4 text-green-500" />
                          ) : (
                            <Building2 className="h-4 w-4 text-purple-500" />
                          )}
                          <span>
                            {entry.user?.name || entry.team?.name || "Unknown"}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {entry.permission}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedDoc.fileUrl, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ================ DELETE CONFIRMATION ================ */}
      <Dialog open={!!deleteDocId} onOpenChange={() => setDeleteDocId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The document will be permanently removed from storage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDocId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
