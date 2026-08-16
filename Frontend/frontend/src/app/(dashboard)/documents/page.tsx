"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Trash2,
  Download,
  Eye,
  X,
  CloudUpload,
  Search,
  Filter,
} from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";
import { V3Input } from "@/components/v3/V3Input";
import { V3Select } from "@/components/v3/V3Select";
import { V3Modal } from "@/components/v3/V3Modal";
import { V3Tabs } from "@/components/v3/V3Tabs";

// Types
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
  if (!bytes || bytes === 0) return "0 B";
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

const formatType = (type: string) =>
  type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

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
  const [selectedPermission, setSelectedPermission] = useState<"view" | "download" | "manage">("view");

  const teamsList = teams.filter((t) => t.type === "team");
  const selectedUserIds = selectedAccess.filter((a) => a.targetType === "user").map((a) => a.userId);
  const selectedTeamIds = selectedAccess.filter((a) => a.targetType === "team").map((a) => a.teamId);

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
      {/* Users Select */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground block">User Access</label>
        <div className="flex gap-2">
          <V3Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            options={[
              { value: "", label: "Select user..." },
              ...users
                .filter((u) => !selectedUserIds.includes(u.id))
                .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
            ]}
          />
          <V3Button type="button" size="sm" onClick={addUserAccess} disabled={!selectedUser}>
            Add
          </V3Button>
        </div>
      </div>

      {/* Teams Select */}
      {teamsList.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground block">Team Access</label>
          <div className="flex gap-2">
            <V3Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              options={[
                { value: "", label: "Select team..." },
                ...teamsList
                  .filter((t) => !selectedTeamIds.includes(t.id))
                  .map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
            <V3Button type="button" size="sm" onClick={addTeamAccess} disabled={!selectedTeam}>
              Add
            </V3Button>
          </div>
        </div>
      )}

      {/* Selected Access List */}
      {selectedAccess.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-foreground">
            Configured Access Rules ({selectedAccess.length})
          </p>
          <div className="space-y-2">
            {selectedAccess.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border text-xs">
                <span className="font-semibold text-foreground">{entry.label}</span>
                <div className="flex items-center gap-2">
                  <V3Select
                    value={entry.permission}
                    onChange={(e) => updatePermission(idx, e.target.value as any)}
                    className="w-24 h-7 text-[11px]"
                    options={PERMISSIONS}
                  />
                  <button type="button" onClick={() => removeAccess(idx)} className="text-muted-foreground hover:text-rose-500">
                    <X className="h-3.5 w-3.5" />
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
      onFilesSelected(multiple ? droppedFiles.slice(0, 10) : [droppedFiles[0]]);
    },
    [multiple, onFilesSelected]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-border hover:border-indigo-500/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
        />
        <CloudUpload className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
        <p className="text-xs font-semibold text-foreground">
          {isDragging ? "Drop files here" : "Click or drag & drop files"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">PDF, DOC, DOCX, XLSX, CSV, PNG, JPG (Max 10MB)</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border text-xs">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                <span className="font-semibold truncate">{file.name}</span>
                <span className="text-muted-foreground text-[10px]">({formatFileSize(file.size)})</span>
              </div>
              {onRemoveFile && (
                <button type="button" onClick={() => onRemoveFile(idx)} className="text-muted-foreground hover:text-rose-500">
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

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("list");
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [singleFile, setSingleFile] = useState<File[]>([]);
  const [singleTitle, setSingleTitle] = useState("");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleType, setSingleType] = useState("other");
  const [singleAccess, setSingleAccess] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: documentsData, isLoading } = useQuery({
    queryKey: ["documents", currentPage, searchText, typeFilter],
    enabled: status === "authenticated",
    queryFn: async () => {
      let url = `${backendUrl}/documents?page=${currentPage}&limit=10`;
      if (searchText.trim()) url += `&search=${encodeURIComponent(searchText.trim())}`;
      if (typeFilter !== "all") url += `&type=${typeFilter}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return res.data;
    },
  });

  const { data: usersForAccess = [] } = useQuery({
    queryKey: ["usersForAccess"],
    enabled: status === "authenticated",
    queryFn: async () => {
      const res = await axios.get(`${backendUrl}/users?pageNo=1&pageSize=200`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return res.data?.data?.data || res.data?.data || [];
    },
  });

  const { data: teamsForAccess = [] } = useQuery({
    queryKey: ["teamsForAccess"],
    enabled: status === "authenticated",
    queryFn: async () => {
      const res = await axios.get(`${backendUrl}/teams`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return (res.data?.data || []).map((t: any) => ({ id: t.id, name: t.name, type: "team" }));
    },
  });

  const handleSingleUpload = async () => {
    if (!singleFile[0] || !singleTitle.trim()) {
      toast({ title: "Validation Error", description: "File and title are required.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", singleFile[0]);
      formData.append("title", singleTitle);
      formData.append("description", singleDescription);
      formData.append("type", singleType);
      formData.append("access", JSON.stringify(singleAccess));

      await axios.post(`${backendUrl}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({ title: "Document Uploaded", description: "File uploaded successfully." });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSingleFile([]);
      setSingleTitle("");
      setSingleDescription("");
      setSingleAccess([]);
      setActiveTab("list");
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error?.response?.data?.message || "Upload error", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDocId) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${backendUrl}/documents/${deleteDocId}`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      toast({ title: "Document Deleted", description: "Document removed successfully." });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteDocId(null);
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error?.response?.data?.message || "Error deleting file", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const docs = documentsData?.data?.data || documentsData?.data || [];
  const pagination = documentsData?.data?.pagination || documentsData?.pagination || {};
  const totalDocs = pagination?.totalItems || docs.length;

  return (
    <div className="space-y-6">
      {/* V3 Page Header */}
      <V3PageHeader
        title="Documents Vault"
        description="Manage organization policies, contracts, employee records, and file permissions."
        badgeText={`${totalDocs} Vault Files`}
        badgeIcon={<FileText className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />}
      />

      <div className="space-y-4">
        <V3Tabs
          tabs={[
            { id: "list", label: "All Documents" },
            { id: "upload", label: "Upload Document" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab 1: Documents List */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <V3Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:w-80">
                <V3Input
                  placeholder="Search documents..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Type:</span>
                <V3Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-36"
                  options={[
                    { value: "all", label: "All Types" },
                    ...DOCUMENT_TYPES,
                  ]}
                />
              </div>
            </V3Card>

            <V3Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                      <th className="p-3.5 pl-4">Document Title</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Uploaded By</th>
                      <th className="p-3.5">Size</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/40">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx}>
                          <td colSpan={6} className="h-12 animate-pulse bg-muted/20" />
                        </tr>
                      ))
                    ) : docs.length > 0 ? (
                      docs.map((doc: Document) => (
                        <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground leading-tight">{doc.title}</p>
                                <p className="text-[10px] text-muted-foreground">{doc.fileName}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-500/20 capitalize">
                              {formatType(doc.type)}
                            </span>
                          </td>

                          <td className="p-3.5 text-muted-foreground">
                            {doc.uploadedBy?.name || "System"}
                          </td>

                          <td className="p-3.5 text-muted-foreground">
                            {formatFileSize(doc.fileSize)}
                          </td>

                          <td className="p-3.5 text-muted-foreground">
                            {formatDate(doc.createdAt)}
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setShowDetail(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                onClick={() => window.open(doc.fileUrl, "_blank")}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                                onClick={() => setDeleteDocId(doc.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                          No documents found in vault.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </V3Card>
          </div>
        )}

        {/* Tab 2: Upload Form */}
        {activeTab === "upload" && (
          <V3Card className="p-6 max-w-xl mx-auto space-y-4">
            <h2 className="text-base font-bold tracking-tight text-foreground">Upload New Vault Document</h2>

            <DropZone
              onFilesSelected={(files) => setSingleFile(files)}
              files={singleFile}
              onRemoveFile={() => setSingleFile([])}
            />

            <div className="space-y-4">
              <V3Input
                label="Title *"
                placeholder="Document Title"
                value={singleTitle}
                onChange={(e) => setSingleTitle(e.target.value)}
              />

              <V3Input
                label="Description"
                placeholder="Optional notes or summary..."
                value={singleDescription}
                onChange={(e) => setSingleDescription(e.target.value)}
              />

              <V3Select
                label="Document Category"
                value={singleType}
                onChange={(e) => setSingleType(e.target.value)}
                options={DOCUMENT_TYPES}
              />

              <div className="pt-2">
                <AccessControlPicker
                  selectedAccess={singleAccess}
                  setSelectedAccess={setSingleAccess}
                  users={usersForAccess}
                  teams={teamsForAccess}
                />
              </div>

              <V3Button
                onClick={handleSingleUpload}
                isLoading={isUploading}
                disabled={!singleFile[0] || !singleTitle.trim()}
                className="w-full mt-4"
              >
                Upload Document
              </V3Button>
            </div>
          </V3Card>
        )}
      </div>

      {/* Detail Modal */}
      <V3Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedDoc?.title || "Document Detail"}
        description={selectedDoc?.fileName}
      >
        {selectedDoc && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Category</span>
              <p className="font-semibold capitalize text-foreground">{selectedDoc.type?.replace("_", " ")}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Uploaded By</span>
              <p className="font-semibold text-foreground">{selectedDoc.uploadedBy?.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">File Size</span>
              <p className="font-semibold text-foreground">{formatFileSize(selectedDoc.fileSize)}</p>
            </div>
            <div className="pt-3 flex justify-end gap-2 border-t border-border/60">
              <V3Button variant="outline" onClick={() => setShowDetail(false)}>Close</V3Button>
              <V3Button onClick={() => window.open(selectedDoc.fileUrl, "_blank")}>Download File</V3Button>
            </div>
          </div>
        )}
      </V3Modal>

      {/* Delete Modal */}
      <V3Modal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        title="Delete Document"
        description="Are you sure you want to delete this document from the organization vault?"
      >
        <div className="pt-2 flex justify-end gap-2">
          <V3Button variant="outline" onClick={() => setDeleteDocId(null)}>Cancel</V3Button>
          <V3Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </V3Button>
        </div>
      </V3Modal>
    </div>
  );
}