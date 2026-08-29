"use client";

import { type LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const isAnyChildActive = (children: { url: string }[] = []) => {
    return children.some(
      (child) => pathname === child.url || pathname.startsWith(child.url)
    );
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden px-1">
      <SidebarGroupLabel className="uppercase text-[11px] font-bold tracking-wider text-slate-400 px-3 my-1">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
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
                  className="py-2.5 px-3 h-10 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 data-[active=true]:bg-amber-600 data-[active=true]:text-white font-medium transition-all"
                >
                  {isExternal(item.url) ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 w-full"
                    >
                      {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                      <span className="whitespace-nowrap text-sm leading-none">
                        {item.name}
                      </span>
                      {item.children && (
                        <span className="ml-auto">
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 opacity-70" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          )}
                        </span>
                      )}
                    </a>
                  ) : (
                    <Link href={item.url || "#"} className="flex items-center gap-3 w-full">
                      {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                      <span className="whitespace-nowrap text-sm leading-none">
                        {item.name}
                      </span>
                      {item.children && (
                        <span className="ml-auto">
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5 opacity-70" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          )}
                        </span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {item.children && isOpen && (
                <div className="ml-4 my-1 border-l border-slate-700/60 pl-3 space-y-1">
                  {item.children.map((child) => (
                    <SidebarMenuItem key={child.name} className="relative">
                      <SidebarMenuButton
                        isActive={
                          pathname === child.url || pathname.startsWith(child.url)
                        }
                        asChild
                        className="py-2 px-2.5 h-8 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 data-[active=true]:text-amber-500 data-[active=true]:font-semibold transition-colors"
                      >
                        <Link href={child.url}>
                          <span className="whitespace-nowrap">
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