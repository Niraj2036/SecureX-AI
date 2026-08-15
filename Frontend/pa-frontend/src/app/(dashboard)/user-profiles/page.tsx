"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";
import { Mail, Briefcase, UserCheck, Building2, Users, Calendar, ShieldCheck, FileText } from "lucide-react";

const Page = () => {
  const { data: userSession } = useSession();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { userDetails } = useSessionStore((state) => state);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const targetId = userId || userDetails?.id;

  const {
    data: userProfileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["useDataforProfile", targetId],
    queryFn: async () => {
      const url =
        targetId === userDetails?.id
          ? `${backendUrl}/users/me`
          : `${backendUrl}/users/${targetId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${userSession?.user?.token}` },
      });
      return response.data;
    },
    enabled: !!targetId && !!userSession?.user?.token,
  });

  if (profileLoading) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <div className="animate-pulse flex items-center space-x-3 text-muted-foreground">
          <div className="h-6 w-6 rounded-full bg-primary/20 animate-spin" />
          <span>Loading employee profile...</span>
        </div>
      </div>
    );
  }

  if (profileError || !userProfileData?.data) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-destructive">Unable to load profile</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The requested employee details could not be retrieved.
        </p>
      </div>
    );
  }

  const user = userProfileData.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header Banner & Overview */}
      <div className="v3-card p-6 bg-gradient-to-r from-background via-muted/30 to-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold tracking-tight">{user?.name}</h1>
                <Badge variant={user?.status === "active" ? "default" : "secondary"}>
                  {user?.status || "Active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {user?.designation || "Team Member"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 font-medium text-xs">
              Role: {user?.role || "Employee"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="v3-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{user?.department?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Team</span>
                  <span className="font-medium">{user?.team?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Direct Manager</span>
                  <span className="font-medium">{user?.manager?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span className="font-medium">{user?.empId || user?.id?.substring(0, 8)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="v3-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Employment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Joining Date</span>
                  <span className="font-medium">
                    {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="font-medium capitalize">{user?.status || "Active"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">System Role</span>
                  <span className="font-medium capitalize">{user?.role || "Employee"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card className="v3-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Employee Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user?.employeeDocuments && user.employeeDocuments.length > 0 ? (
                <div className="divide-y">
                  {user.employeeDocuments.map((doc: any) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No employee documents attached.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;