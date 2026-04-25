"use client";

import Link from "next/link";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";

function SettingSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-1/4 bg-white rounded-lg shadow p-4 flex flex-col mr-4">
      <h2 className="font-semibold text-lg">Company Information</h2>
      <Separator className="mt-4" />
      <nav className="flex flex-col space-y-2 mt-2">
        <Link
          href="/setting"
          className={clsx(
            "w-full flex items-center gap-2 text-black px-2 py-2 rounded-md hover:bg-secondary-100 hover:text-primary-400",
            { "bg-secondary-100 font-semibold": pathname === "/setting" }
          )}
        >
          <Image src="/settings/company.png" width={20} height={20} alt="Company Icon" />
          Company
        </Link>
        <Link
          href="/setting/departments"
          className={clsx(
            "w-full flex items-center gap-2 text-black px-2 py-2 rounded-md hover:bg-secondary-100 hover:text-primary-400",
            { "bg-secondary-100 font-semibold": pathname === "/setting/departments" }
          )}
        >
          <Image src="/settings/department.png" width={20} height={20} alt="Departments Icon" />
          Departments
        </Link>
        <Link
          href="/setting/teams"
          className={clsx(
            "w-full flex items-center gap-2 text-black px-2 py-2 rounded-md hover:bg-secondary-100 hover:text-primary-400",
            { "bg-secondary-100 font-semibold": pathname === "/setting/teams" }
          )}
        >
          <Image src="/settings/team.png" width={20} height={20} alt="Teams Icon" />
          Teams
        </Link>
      </nav>
    </div>
  );
}

export default SettingSidebar;
