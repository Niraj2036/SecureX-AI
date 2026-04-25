"use client";

import * as React from "react";
import {
  BookCheck,
  BusFront,
  ChartNoAxesCombined,
  Cog,
  GalleryVerticalEnd,
  Headset,
  LayoutDashboard,
  MessageCircle,
  Search,
  Settings,
  SquareTerminal,
  SquareUserRound,
  Target,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { NavProjects } from "@/components/sidebar/nav-projects";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { SidebarLogo } from "@/app/(dashboard)/setting/(company)/_components/sidebar-server";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Icon mapping
const iconMap = {
  LayoutDashboard,
  Target,
  BookCheck,
  SquareTerminal,
  SquareUserRound,
  ChartNoAxesCombined,
  Cog,
  Settings,
  Headset,
  BusFront,
  GalleryVerticalEnd,
  MessageCircle,
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  dashboardData: any;
  userRole?: string;
}

export function AppSidebar({ dashboardData, userRole: serverUserRole, ...props }: AppSidebarProps) {
  const { open } = useSidebar();
  const { userRole: clientUserRole } = useSessionStore((state) => state);
  const { data, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Use server user role or fallback to client user role
  const userRole = serverUserRole || clientUserRole;

  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    Performance: false,
    "Report and Analytics": false,
  });

  const { data: owners } = useQuery({
    queryKey: ["profileDataList", status],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/owners`, {
        headers: {
          Authorization: `Bearer ${data?.user?.token}`,
        },
      });
      return response.data;
    },
  })

  const groupedUsers = useMemo(() => {
    if (!owners?.data?.users) return {};

    return owners.data.users.reduce((acc: any, user: any) => {
      const teamName = user.team?.name || 'Other';
      if (!acc[teamName]) {
        acc[teamName] = [];
      }
      acc[teamName].push(user);
      return acc;
    }, {});
  }, [owners]);

  // Filter users based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedUsers;

    const result: Record<string, any[]> = {};

    Object.keys(groupedUsers).forEach(teamName => {
      const filteredUsers = groupedUsers[teamName].filter((user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredUsers.length > 0) {
        result[teamName] = filteredUsers;
      }
    });

    return result;
  }, [groupedUsers, searchTerm]);

  const handleSelect = (user: any) => {
    setSelectedUser(user);
    setIsOpen(false);
    handleProfileChange(user.id);
  };

  const { data: companyDetails } = useQuery({
    queryKey: ["companyDetails"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/company`, {
        headers: {
          Authorization: `Bearer ${data?.user?.token}`,
        },
      });
      return response.data;
    },
  })

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      ?.map((part: any) => part[0])
      ?.join('')
      ?.toUpperCase()
      ?.substring(0, 2);
  };

  const handleProfileChange = (value: string) => {
    router.push(`/user-profiles?id=${value}`);
  };

  const transformedDashboardData = React.useMemo(() => {
    const transformMenu = (items: any[]): Array<any> => {
      return items.map(item => ({
        ...item,
        icon: item.icon ? iconMap[item.icon as keyof typeof iconMap] : undefined,
        children: item.children ? transformMenu(item.children) : undefined,
      }));
    };

    return {
      ...dashboardData,
      menu: transformMenu(dashboardData.menu || []),
      general: dashboardData.general ? transformMenu(dashboardData.general) : undefined,
    };
  }, [dashboardData]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="space-y">
        <div className="flex items-center mt-2 ml-4">
          {open ? (
            companyDetails?.data?.whitelabel ? (
              companyDetails?.data?.logo ? (
                <Image
                  src={companyDetails.data.logo}
                  alt="Company Logo"
                  width={72}
                  height={32}
                  className="rounded-md object-contain w-36 h-12"
                />
              ) : (
                <Image
                  src="/logo.svg"
                  alt="Logo Icon"
                  width={72}
                  height={32}
                  className="p-1 object-contain w-36 h-12"
                />
              )
            ) : (
              <Image
                src="/logo.svg"
                alt="Logo Icon"
                width={72}
                height={32}
                className="p-1 object-contain w-36 h-12"
              />
            )
          ) : (
            <Image
              src="/logo-icon.png"
              alt="Logo Icon"
              width={72}
              height={32}
              className="p-1 object-contain w-36 h-8"
            />
          )}
        </div>

      </SidebarHeader>

      <SidebarContent className="px-2">
        {(userRole === "team_lead" || userRole === "dept_head" || userRole === "admin") && (
          <>
            <NavProjects
              title="Team"
              projects={dashboardData.Team}
              openStates={openStates}
              setOpenStates={setOpenStates}
            />
            <Select
              onValueChange={(value) => {
                const selected = Object.values(filteredGroups)
                  .flat()
                  .find((u: any) => u.id === value);
                if (selected) handleSelect(selected);
              }}
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <SelectTrigger className="w-56 ml-3">
                <SelectValue placeholder="Select Profile">
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {getInitials(selectedUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{selectedUser.name}</span>
                    </div>
                  ) : (
                    "Select Profile"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-56 p-0" align="start">
                <div className="sticky top-0 z-10 bg-background p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <ScrollArea className="h-64 w-full">
                  {Object.keys(filteredGroups).length > 0 ? (
                    Object.entries(filteredGroups).map(([teamName, users]) => (
                      <div key={teamName} className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium text-muted-foreground bg-slate-50 top-0">
                          {teamName}
                        </div>
                        <SelectGroup>
                          {(users as any[]).map((user: any) => (
                            <SelectItem
                              key={user.id}
                              value={user.id}
                              className="px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate leading-tight">{user.name}</p>
                                </div>
                              </div>
                              {user?.team && (
                                <div className="pl-9 -mt-0.5">
                                  <Badge
                                    variant="outline"
                                    className="text-xs whitespace-nowrap h-5 px-1.5 font-normal"
                                  >
                                    {user?.team.name}
                                  </Badge>
                                </div>
                              )}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No users found
                    </div>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </>
        )}

        <NavProjects
          title="Menu"
          projects={transformedDashboardData.menu}
          openStates={openStates}
          setOpenStates={setOpenStates}
        />

        {transformedDashboardData.general && (
          <NavProjects
            title="General"
            projects={transformedDashboardData.general}
            openStates={openStates}
            setOpenStates={setOpenStates}
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
