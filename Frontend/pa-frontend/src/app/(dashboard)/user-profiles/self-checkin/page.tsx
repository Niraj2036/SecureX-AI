"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FormBuilder from "../../../../components/user-profiles-components/formbuilder";
import GroupCheckin from "../../../../components/user-profiles-components/group-checkin";
import Image from "next/image";
import React from "react";
import axios from "axios";
import profile from "../../../../../public/okr/feedback/profile.png";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const SelfCheckin = () => {
  const { data: userSession } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const {
    data: userProfileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["userProfile", userSession?.user.id],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/me`, {
        headers: { Authorization: `Bearer ${userSession?.user.token}` },
      });
      console.log(response.data);
      return response.data;
    },
  });
  if (profileError) return <p>Error fetching profile</p>;
  if (!userProfileData) return <p>No profile data available 1 on 1</p>;
  return (
    <>
      <div className="text-left">
        <h1 className="text-black text-lg font-medium">Check-Ins</h1>
        <Tabs defaultValue="tab-1" className="pt-2">
          <TabsList className="border bg-white">
            <TabsTrigger
              value="tab-1"
              className="data-[state=active]:bg-secondary-500 data-[state=active]:text-white"
            >
              Self Check-Ins
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="data-[state=active]:bg-secondary-500 data-[state=active]:text-white"
            >
              Group Check-Ins
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">
            <div>
              <Card className="border-none">
                <div className="px-2 text-left">
                  <CardTitle className="font-bold text-lg ml-3 mt-2">
                    My Check-Ins
                  </CardTitle>
                  <CardDescription className="ml-3">
                    Saturday, 30 November 2024
                  </CardDescription>
                </div>

                {/* Profile Card*/}
                <Card className="mt-4 px-2 mb-3  p-4 flex items-center bg-neutral-50 shadow-sm">
                  <div className="w-10 h-10 relative">
                    <Avatar>
                      <AvatarImage
                        src={userProfileData?.data?.avatar || profile}
                        alt={`${userProfileData?.data?.name}'s avatar`}
                      />
                      <AvatarFallback>
                        {userProfileData?.data?.name[0].toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="ml-4 flex flex-col">
                    <h1 className="font-bold text-lg">
                      {userProfileData?.data?.name}
                    </h1>

                    <div className="grid grid-cols-3 gap-8 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-sm text-black">
                          {userProfileData?.data?.email || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Job Title</p>
                        <p className="text-sm text-black">
                          {userProfileData?.data?.designation || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Report To</p>
                        <p className="text-sm text-black">
                          {userProfileData?.data?.manager?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <FormBuilder filled={true} from={"profile"} type={"checkIn"} />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tab-2">
            <p className="p-4 text-left text-xs text-muted-foreground">
              <GroupCheckin />
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SelfCheckin;
