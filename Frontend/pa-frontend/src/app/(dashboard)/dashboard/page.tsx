
import { auth } from "@/auth";
import CompanyName from "@/components/ui/CompanyName";

function getTimeBasedGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good morning";
  if (currentHour < 18) return "Good afternoon";
  return "Good evening";
}

async function Page() {
  const data = await auth();
  const greeting = getTimeBasedGreeting();

  return (
    <div className="p-6 space-y-6 w-full mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {greeting}, {data?.user?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            <CompanyName/>
          </p>
        </div>
      </div>
      <div>
        <p>Dashboard</p>
      </div>
    </div>
  );
}

export default Page;

