"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, Bell, User } from "lucide-react";
import clsx from "clsx";

const OkrAdminSideBar = () => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col space-y-1">
      <Link href="/setting/admin">
        <div
          className={clsx(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-muted hover:text-indigo-600",
            pathname === "/setting/admin"
              ? "bg-indigo-500/10 text-indigo-600 font-semibold"
              : "text-muted-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Manage Organization
        </div>
      </Link>
      <Link href="/setting/admin/users">
        <div
          className={clsx(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-muted hover:text-indigo-600",
            pathname === "/setting/admin/users"
              ? "bg-indigo-500/10 text-indigo-600 font-semibold"
              : "text-muted-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          Users Management
        </div>
      </Link>
      <div
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-indigo-600 cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        Notifications
      </div>
      <div
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-indigo-600 cursor-pointer"
      >
        <User className="h-4 w-4" />
        Manage Account
      </div>
    </div>
  );
};

export default OkrAdminSideBar;