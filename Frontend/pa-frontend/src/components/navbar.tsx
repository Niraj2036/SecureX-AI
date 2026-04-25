"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { BellIcon, LogOutIcon, UserIcon, Settings2Icon, BookOpen } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import useSessionStore from "@/store/sessionStore";
import useSignupStore from "@/store/signupStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data, status } = useSession();
  const { notificationNumber, setUserDetails } = useSessionStore((state) => state);
  const { data: session } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter()

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/notification`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      setUnreadCount(response.data?.pagination?.unreadCount);
      return Array.isArray(response.data?.data) ? response.data.data : [];
    },
    enabled: !!session?.user?.token,
  });

  const { data: userProfileDetails } = useQuery({
    queryKey: ["userProfileDetails"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/me`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (response?.data?.data?.status === "banned") {
        toast({
          title: "Account Banned",
          description: "Your account has been banned. Please contact support.",
          variant: "destructive",
        });
        // router.push("/auth/login")
        await signOut({ redirect: true, callbackUrl: "/auth/login" });
      }
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  useEffect(() => {
    if (userProfileDetails) {
      setUserDetails(userProfileDetails.data);
    }
  }, [userProfileDetails, setUserDetails]);

  // const unreadCount = notifications.filter((n:any) => !n.isRead).length;

  const formatTimeAgo = (dateString: any) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `${backendUrl}/notification/${notificationId}/mark-as-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="flex flex-row items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="https://guide.securexai.app/docs/intro"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="hover:bg-slate-100 text-sm font-medium transition-colors h-10 w-10 rounded-full border border-slate-300 flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Docs</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full bg-gray-100 hover:bg-slate-100 transition-colors"
                >
                  <BellIcon className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium border-2 border-white"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            className="w-80 max-h-96 overflow-y-auto p-0 shadow-lg rounded-xl border border-slate-200"
            align="end"
            sideOffset={8}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-xl">
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="outline" className="bg-transparent text-xs font-normal">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            <div className="py-1">
              {isLoading && (
                <div className="flex justify-center items-center p-4">
                  <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                </div>
              )}

              {isError && (
                <p className="text-center py-4 text-sm text-slate-500">
                  Error fetching notifications.
                </p>
              )}

              {!isLoading && !isError && notifications.length === 0 && (
                <div className="py-6 px-4 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 mb-3">
                    <BellIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No notifications</p>
                  <p className="text-xs text-slate-500 mt-1">
                    We&apos;ll notify you when something arrives
                  </p>
                </div>
              )}

              {!isLoading && !isError && notifications.length > 0 && (
                <div>
                  {notifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "px-4 py-3 cursor-pointer hover:bg-slate-50 focus:bg-slate-50",
                        !notification.isRead && "bg-gray-50/40"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-9 h-9 bg-gray-100 text-black rounded-full flex items-center justify-center">
                            <span className="font-semibold text-sm">
                              {notification.message.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm text-slate-700 mb-1 line-clamp-2",
                            !notification.isRead && "font-medium"
                          )}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <div className="flex-shrink-0 self-center">
                            <div className="h-2 w-2 rounded-full bg-secondary-600"></div>
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}

                  {notifications.length > 5 && (
                    <div className="px-4 py-2.5 text-center border-t border-slate-200">
                      <Link
                        href="/notifications"
                        className="text-xs font-medium text-black hover:text-secondary-700"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-slate-200">
                    <AvatarImage src={userProfileDetails?.data?.avatar || "/default-profile.png"} alt="Profile" />
                    <AvatarFallback className="bg-gray-200 text-black-">
                      {status === "authenticated" && data?.user?.name
                        ? data.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* <Image src={userProfileDetails?.data?.avatar} alt="User Avatar" height={10} width={10} /> */}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Account</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            className="w-72 p-0 shadow-lg rounded-xl border border-slate-200"
            align="end"
            sideOffset={8}
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 border-2 border-slate-100">
                    <AvatarImage src={userProfileDetails?.data?.avatar || "/default-profile.png"} alt="Profile" />
                    <AvatarFallback className="bg-gray-200 text-black">
                      {status === "authenticated" && data?.user?.name
                        ? data.user.name.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-slate-900">
                    {status === "authenticated" && data?.user?.name
                      ? data.user.name
                      : "User"}
                  </h4>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">
                    {status === "authenticated" && data?.user?.email
                      ? data.user.email
                      : "user@example.com"}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-slate-200" />

            <div className="p-2">
              <Link href="/profile">
                <DropdownMenuItem className="rounded-md cursor-pointer flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  View Profile
                </DropdownMenuItem>
              </Link>

              {/* <Link href="/setting">
                <DropdownMenuItem className="rounded-md cursor-pointer flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:bg-slate-100">
                  <Settings2Icon className="h-4 w-4 text-slate-500" />
                  Settings
                </DropdownMenuItem>
              </Link> */}

              <DropdownMenuItem
                className="rounded-md cursor-pointer flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:bg-red-50"
                onClick={() => {
                  // Reset both Zustand stores
                  useSessionStore.getState().reset();
                  useSignupStore.getState().reset();
                  
                  // Then sign out
                  signOut();
                }}
              >
                <LogOutIcon className="h-4 w-4 text-red-500" />
                Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  );
};

export default Navbar;
