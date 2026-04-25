"use client";

import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Settingnavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Determine which tab should be active based on pathname
  const getTabValue = () => {
    if (pathname.startsWith("/setting/importdata")) return "/setting/importdata";
    if (pathname.startsWith("/setting/profiles")) return "/setting/profiles";
    if (pathname.startsWith("/setting/admin")) return "/setting/admin";
    return "/setting"; // Default to "Company Information" for /setting and its subpaths
  };

  return (
    <>
      <Tabs
        value={getTabValue()}
        onValueChange={(value) => {
          router.push(value);
        }}
      >
        <TabsList className="h-auto rounded-none border-b border-border bg-transparent p-0 w-full justify-start">
          <TabsTrigger
            value="/setting"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Company Information
          </TabsTrigger>
          <TabsTrigger
            value="/setting/admin"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
             Admin
          </TabsTrigger>
          <TabsTrigger
            value="/setting/importdata"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Import Data
          </TabsTrigger>
          <TabsTrigger
            value="/setting/profiles"
            className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Profiles and Permissions
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
};

export default Settingnavbar;
