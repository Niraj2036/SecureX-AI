"use client";

import React, { useEffect, useState } from "react";

import ActiveUsers from "@/components/setting-components/activeuserstable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Inviteuser from "@/components/setting-components/invite-usersheet";
import Link from "next/link";
import OkrAdminSideBar from "@/components/setting-components/ork-admin-sidebar";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import integration from "../../../../../../../public/settings/integration.png";
import manage from "../../../../../../../public/settings/manage.png";
import notifications from "../../../../../../../public/settings/notifications.png";
import okr from "../../../../../../../public/settings/okr.png";
import person from "../../../../../../../public/settings/person.png";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import users from "../../../../../../../public/settings/users.png";
import add from "../../../../../../../public/settings/add.png";

const Page = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState(0);
  const pathname = usePathname();

  const {
    data: userData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["users", status],
    enabled: status === "authenticated",
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/users`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      console.log(response.data);
      return response.data.data.data;
    },
  });

  useEffect(() => {
    if (Array.isArray(userData) && userData.length > 0) {
      setActive(userData.filter((user) => user.status === "active").length);
      setPending(userData.filter((user) => user.status === "pending").length);
    }
  }, [userData, status]);



  if (isLoading) {
    return <div>Loading...</div>;
  }
  // if (isError) {
  //   return <div>Something went wrong</div>;
  // }

  return (
    <div className="flex p-4 bg-gray-100 min-h-screen ">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded-lg shadow p-4 mr-2">
        <h2 className="font-semibold text-lg">Admin</h2>
        <Separator className="mt-4" />
        <br></br>
        <OkrAdminSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white rounded-lg  p-4 ml-2">
        <h1 className="font-semibold text-xl text-slate-600">
          User Management
        </h1>
        {/* {JSON.stringify(userData.data)} */}

        <Separator className="mt-4"></Separator>
        {/* <hr /> */}
        <div>
          <Card className="rounded-lg border-none shadow-none mb-2">
            <div className="flex items-center justify-between mt-3 shadow-none ">
              <div className="flex items-center space-x-8 shadow-none">
                <div className="cursor-pointer pb-2  ml-4 ">
                  Active users ({active})
                </div>
                <div className="cursor-pointer pb-2  ">
                  Inactive users ({pending})
                </div>
              </div>
              <div className="ml-auto">
                <Inviteuser>
                  <Button className="rounded-full w-auto mx-5 my-2 ">
                    <Image src={add} alt="add" className="w-4" 
                      width={16}
                      height={16} />
                  </Button>
                </Inviteuser>
              </div>
            </div>
            <ActiveUsers />
            {/* <div className="py-32"></div> */}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
