"use client";

import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { usePathname, useRouter } from "next/navigation";

import React from "react";

const EmployeeNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="pb-4">
      <Tabs
        defaultValue="tab-1"
        value={pathname}
        onValueChange={(value) => {
          router.push(value);
        }}
      >
        <TabsList className="h-auto rounded-none border-b border-border bg-transparent p-0 w-full justify-start">
          <TabsTrigger
            value="/employee"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Employees
          </TabsTrigger>
          <TabsTrigger
            value="/employee/teams"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Teams
          </TabsTrigger>
          <TabsTrigger
            value="/employee/orgchart"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            ORG Chart
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default EmployeeNavbar;
