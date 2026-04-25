import Settingnavbar from "@/components/settingnavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Settingnavbar />
      {children}
    </>
  );
}
