"use client";

import React, { useEffect, useState } from "react";
import ActiveUsers from "@/components/setting-components/activeuserstable";
import Inviteuser from "@/components/setting-components/invite-usersheet";
import OkrAdminSideBar from "@/components/setting-components/ork-admin-sidebar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Users, UserPlus, UserCheck, UserX } from "lucide-react";
import { V3PageHeader } from "@/components/v3/V3PageHeader";
import { V3Card } from "@/components/v3/V3Card";
import { V3Button } from "@/components/v3/V3Button";

const Page = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState(0);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["users", status],
    enabled: status === "authenticated",
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/users`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
      return response.data.data.data;
    },
  });

  useEffect(() => {
    if (Array.isArray(userData) && userData.length > 0) {
      setActive(userData.filter((user) => user.status === "active").length);
      setPending(userData.filter((user) => user.status === "pending").length);
    }
  }, [userData, status]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-sm">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <V3PageHeader
        title="User Management"
        description="Manage administrator users and access privilege delegation."
        badgeText="Admin Panel"
        badgeIcon={<Users className="h-3 w-3 text-indigo-600" />}
      >
        <Inviteuser>
          <V3Button>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite User
          </V3Button>
        </Inviteuser>
      </V3PageHeader>

      <div className="flex gap-6">
        {/* Left Sidebar */}
        <V3Card className="w-56 flex-shrink-0 p-4 h-fit">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
          <OkrAdminSideBar />
        </V3Card>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <V3Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{active}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </div>
              </div>
            </V3Card>
            <V3Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <UserX className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pending}</p>
                  <p className="text-xs text-muted-foreground">Inactive Users</p>
                </div>
              </div>
            </V3Card>
          </div>

          {/* Users Table */}
          <V3Card className="overflow-hidden p-0">
            <ActiveUsers />
          </V3Card>
        </div>
      </div>
    </div>
  );
};

export default Page;