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
              name: "Employee Management",
              url: "/employee",
              icon: "SquareUserRound",
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
          name: "Settings",
          url: "/setting",
          icon: "Settings",
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

