import { auth } from "@/auth";
import EmployeeNavbar from "@/components/employee-navbar";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const data =await auth()

  if(data?.user.role === "employee") {
    redirect("/dashboard");
  }

  return (
    <>
      <EmployeeNavbar />
      {children}
    </>
  );
}
