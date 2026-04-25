import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebarServer from "@/components/sidebar/app-sidebar-server";
import Navbar from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebarServer />
      <main className="flex-1 flex flex-col">
        <header className="border-b">
          <div className="flex h-16 items-center px-4">
            <SidebarTrigger />
            <div className="ml-auto">
              <Navbar />
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
