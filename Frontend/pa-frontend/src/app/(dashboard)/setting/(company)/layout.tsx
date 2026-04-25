import { auth } from "@/auth";
import SettingSidebar from "@/components/setting-components/setting-sidebar";
import Settingnavbar from "@/components/settingnavbar";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await auth();

  const userRole = data?.user?.role;
  if (userRole && userRole === "employee") {
    redirect("/dashboard");
  }

  return (
    <>
      <Settingnavbar />
      <div className="flex p-4 bg-gray-100 min-h-screen">
        <SettingSidebar />
        {children}
      </div>
    </>
  );
}
