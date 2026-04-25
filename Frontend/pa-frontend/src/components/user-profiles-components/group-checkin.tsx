import React from "react";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import profile from "/public/okr/feedback/profile.png";

const GroupCheckin = () => {
  const router = useRouter();

  return (
    <Card className="p-6 shadow-md bg-white">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            Complete Assessment
            <ChevronDown size={16} strokeWidth={2} className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem>Option 1</DropdownMenuItem>
          <DropdownMenuItem>Option 2</DropdownMenuItem>
          <DropdownMenuItem>Option 3</DropdownMenuItem>
          <DropdownMenuItem>Option 4</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <h1 className="mt-4 text-lg font-semibold">
        5 Team Members Completed the Assessment
      </h1>

      <Card className="mt-4 p-4 flex items-center bg-neutral-50 shadow-sm">
        <div className="w-16 h-16 relative">
          <Image
            src={profile}
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>

        <div className="ml-4 flex flex-col w-full">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-lg text-black">Sara Ali Khan</h1>
            <Button
              className="bg-white border border-primary-500 text-primary-500 hover:bg-slate-200"
              onClick={() => router.push("/user-profiles/group-checkin")}
            >
              View Details
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-3">
            <div>
              <p className="text-xs text-gray-400">Submitted Time</p>
              <p className="text-sm font-medium">
                10 January, 2025 at 11:40 AM
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className="text-sm font-medium">Completed</p>
            </div>
          </div>
        </div>
      </Card>
    </Card>
  );
};

export default GroupCheckin;
