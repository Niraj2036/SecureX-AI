"use client";

import { type LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react"; // Import dropdown icons
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  url: string;
  icon?: React.ComponentType<any>;
  // ...other props
}

function isExternal(url: string) {
  return url.startsWith("http");
}

export function NavProjects({
  projects,
  title,
  openStates,
  setOpenStates,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
    children?: { name: string; url: string }[];
    dropdownIcon?: string;
  }[];
  title: string;
  openStates?: Record<string, boolean>;
  setOpenStates?: (state: Record<string, boolean>) => void;
}) {
  const pathname = usePathname();

  const handleDropdownClick = (itemName: string) => {
    if (setOpenStates && openStates) {
      setOpenStates({
        ...openStates,
        [itemName]: !openStates[itemName],
      });
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case "Check-ins":
        return <CheckInsIcon />;
      case "1 on 1":
        return <OneOnOneIcon />;
      case "Performance Management":
        return <PerformanceManagementIcon />;
      default:
        return null;
    }
  };

  const isAnyChildActive = (children: { url: string }[] = []) => {
    return children.some(
      (child) => pathname === child.url || pathname.startsWith(child.url)
    );
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="uppercase">{title}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isOpen = openStates?.[item.name];
          const isActive =
            (item.url && pathname === item.url) ||
            (item.url && pathname.startsWith(item.url)) ||
            (item.children && isAnyChildActive(item.children));

          return (
            <div key={item.name}>
              <SidebarMenuItem
                className="flex flex-row items-center group/item"
                onClick={
                  item.children
                    ? () => handleDropdownClick(item.name)
                    : undefined
                }
              >
                <SidebarMenuButton
                  isActive={isActive}
                  asChild
                  className="p-6 rounded-xl data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-secondary-400"
                >
                  {isExternal(item.url) ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <item.icon />
                      <span className="whitespace-nowrap text-sm">
                        {item.name}
                      </span>
                      {item.children && (
                        <span className="ml-auto">
                          {isOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </a>
                  ) : (
                    <Link href={item.url || "#"}>
                      <item.icon />
                      <span className="whitespace-nowrap text-sm">
                        {item.name}
                      </span>
                      {item.children && (
                        <span className="ml-auto">
                          {isOpen ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {item.children && isOpen && (
                <div className="ml-4 border-l-2 border-gray-300 pl-4">
                  {item.children.map((child) => (
                    <SidebarMenuItem key={child.name} className="relative my-1">
                      <SidebarMenuButton
                        isActive={
                          pathname === child.url || pathname.startsWith(child.url)
                        }
                        asChild
                        className="py-6 rounded-xl flex items-center hover:bg-secondary-400"
                      >
                        <Link href={child.url}>
                          <span className="whitespace-nowrap text-sm">
                            {child.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const CheckInsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M9 12l2 2 4-4"></path>
  </svg>
);

const OneOnOneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <circle cx="7" cy="7" r="3"></circle>
    <circle cx="17" cy="7" r="3"></circle>
    <path d="M2 20v-2a4 4 0 014-4h2"></path>
    <path d="M22 20v-2a4 4 0 00-4-4h-2"></path>
  </svg>
);

const PerformanceManagementIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M3 3v18h18"></path>
    <rect x="6" y="14" width="4" height="4"></rect>
    <rect x="10" y="10" width="4" height="8"></rect>
    <rect x="14" y="6" width="4" height="12"></rect>
    <path d="M16 4l4 4-4 4"></path>
  </svg>
);
