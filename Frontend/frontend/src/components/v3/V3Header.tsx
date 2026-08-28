"use client";

import React, { useState } from "react";
import { Search, Bell, LogOut, User, ShieldCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function V3Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const getBreadcrumb = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")).join(" / ");
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/60 px-6 h-16 flex items-center justify-between transition-all">
      {/* Path Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        <span className="text-muted-foreground">SecureX</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">{getBreadcrumb()}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Unread Notifications Badge */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-lg hover:bg-muted transition-colors focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600/10 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-500/20">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline-block">
              {session?.user?.name || "Admin"}
            </span>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-card border border-border/80 rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2 border-b border-border/60">
                <p className="font-bold text-foreground leading-tight">{session?.user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                  {session?.user?.email}
                </p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                <User className="h-3.5 w-3.5" /> My Profile
              </Link>
              <Link
                href="/setting"
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Company Settings
              </Link>
              <div className="border-t border-border/60 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="w-full flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
