"use client";

import Link from "next/link";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Building2, Building, Users } from "lucide-react";

function SettingSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-1/4 bg-white dark:bg-slate-900 rounded-lg shadow p-4 flex flex-col mr-4 border border-border/60">
      <h2 className="font-semibold text-lg text-foreground">Company Information</h2>
      <Separator className="mt-4" />
      <nav className="flex flex-col space-y-2 mt-2">
        <Link
          href="/setting"
          className={clsx(
            "w-full flex items-center gap-2 text-foreground px-3 py-2 rounded-md hover:bg-muted hover:text-indigo-600 transition-colors text-sm",
            { "bg-indigo-500/10 text-indigo-600 font-semibold": pathname === "/setting" }
          )}
        >
          <Building2 className="h-4 w-4 text-indigo-600" />
          Company
        </Link>
        <Link
          href="/setting/departments"
          className={clsx(
            "w-full flex items-center gap-2 text-foreground px-3 py-2 rounded-md hover:bg-muted hover:text-indigo-600 transition-colors text-sm",
            { "bg-indigo-500/10 text-indigo-600 font-semibold": pathname === "/setting/departments" }
          )}
        >
          <Building className="h-4 w-4 text-indigo-600" />
          Departments
        </Link>
        <Link
          href="/setting/teams"
          className={clsx(
            "w-full flex items-center gap-2 text-foreground px-3 py-2 rounded-md hover:bg-muted hover:text-indigo-600 transition-colors text-sm",
            { "bg-indigo-500/10 text-indigo-600 font-semibold": pathname === "/setting/teams" }
          )}
        >
          <Users className="h-4 w-4 text-indigo-600" />
          Teams
        </Link>
      </nav>
    </div>
  );
}

export default SettingSidebar;