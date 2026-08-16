import { auth } from "@/auth";
import { AppSidebar } from "./app-sidebar";

export default async function AppSidebarServer(props: any) {
  const session = await auth();
  const userRole = session?.user?.role;

  const dashboardData = {
    Team: [],
    menu: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: "LayoutDashboard",
      },
      ...(userRole && userRole !== "employee"
        ? [
            {
              name: "Employee Directory",
              url: "/employee",
              icon: "SquareUserRound",
            },
            {
              name: "Teams",
              url: "/team",
              icon: "Users",
            },
            {
              name: "Org Chart",
              url: "/org",
              icon: "Network",
            },
            {
              name: "Chat",
              url: "/chat",
              icon: "MessageCircle",
            },
          ]
        : []),
      {
        name: "Documents",
        url: "/documents",
        icon: "FileText",
      },
    ],
    ...(userRole && userRole !== "employee" && {
      general: [
        {
          name: "Company Info",
          url: "/setting",
          icon: "Building2",
        },
        {
          name: "Departments",
          url: "/setting/departments",
          icon: "Building",
        },
        {
          name: "Import Data",
          url: "/setting/importdata",
          icon: "Upload",
        },
        {
          name: "Profiles & Permissions",
          url: "/setting/profiles",
          icon: "Shield",
        },
        {
          name: "Help and Support",
          url: "https://guide.securexai.app/docs/intro",
          icon: "Headset",
        },
      ],
    }),
  };

  return <AppSidebar dashboardData={dashboardData} userRole={userRole} {...props} />;
}