import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data = await auth();

  const userRole = data?.user?.role;
  if (userRole && userRole === "employee") {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 min-h-screen">
      {children}
    </div>
  );
}