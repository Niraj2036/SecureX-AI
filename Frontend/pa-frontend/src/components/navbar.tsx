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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { BellIcon, LogOutIcon, UserIcon, BookOpen, Shield, ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import useSessionStore from "@/store/sessionStore";
import useSignupStore from "@/store/signupStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { data: session, status } = useSession();
  const { setUserDetails } = useSessionStore((state) => state);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/notification`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      setUnreadCount(response.data?.pagination?.unreadCount || 0);
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
        await signOut({ redirect: true, callbackUrl: "/auth/login" });
      }
      return response.data;
    },
    enabled: !!session?.user?.token,
  });

  useEffect(() => {
    if (userProfileDetails?.data) {
      setUserDetails(userProfileDetails.data);
    }
  }, [userProfileDetails, setUserDetails]);

  const formatTimeAgo = (dateString: any) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Documentation Link */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="https://guide.securexai.app/docs/intro"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Documentation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Notifications Dropdown */}
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="relative h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <BellIcon className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent
            className="w-80 p-0 shadow-xl rounded-xl border border-border/60 v3-glass"
            align="end"
            sideOffset={8}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
              {isLoading && (
                <div className="flex justify-center items-center py-6 text-muted-foreground text-xs">
                  Loading notifications...
                </div>
              )}

              {isError && (
                <p className="text-center py-4 text-xs text-destructive">
                  Unable to load notifications.
                </p>
              )}

              {!isLoading && !isError && notifications.length === 0 && (
                <div className="py-8 px-4 text-center">
                  <BellIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">No new notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">You are all caught up!</p>
                </div>
              )}

              {!isLoading && !isError && notifications.length > 0 && (
                <div>
                  {notifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "px-4 py-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 transition-colors",
                        !notification.isRead && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs text-foreground", !notification.isRead && "font-semibold")}>
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 self-center" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      {/* User Avatar Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-9 rounded-lg hover:bg-muted transition-colors">
            <Avatar className="h-7 w-7 border border-border">
              <AvatarImage src={userProfileDetails?.data?.avatar} alt="Profile" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight line-clamp-1">
                {session?.user?.name || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight capitalize">
                {userProfileDetails?.data?.role || "Employee"}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 p-2 shadow-xl rounded-xl border border-border/60 v3-glass"
          align="end"
          sideOffset={8}
        >
          <div className="p-2 border-b border-border/40">
            <p className="text-sm font-semibold text-foreground">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            <Badge variant="outline" className="mt-2 text-[10px] uppercase font-medium">
              <Shield className="h-3 w-3 mr-1 text-primary" />
              {userProfileDetails?.data?.role || "User"}
            </Badge>
          </div>

          <div className="py-1">
            <Link href="/profile">
              <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                View Profile
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="my-1 bg-border/40" />

            <DropdownMenuItem
              className="rounded-lg cursor-pointer flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50"
              onClick={() => {
                useSessionStore.getState().reset();
                useSignupStore.getState().reset();
                signOut();
              }}
            >
              <LogOutIcon className="h-3.5 w-3.5 text-rose-500" />
              Sign Out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navbar;