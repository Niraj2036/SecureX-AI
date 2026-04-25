"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Box, House, PanelsTopLeft } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AvatarImage } from "@radix-ui/react-avatar";
import FormBuilder from "@/components/user-profiles-components/formbuilder";
import Image from "next/image";
import InfoCard from "@/components/statcard";
import React from "react";
import SelfCheckin from "@/components/user-profiles-components/self-checkin";
import axios from "axios";
import profile from "../../../../public/employee/profile.png";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useSessionStore from "@/store/sessionStore";
import UserTemplateTables from "@/components/user-profiles-components/userTemplateTables";
import UserRecognition from "@/components/user-profiles-components/userRecognition";

const Page = () => {
  const { data: userSession, status } = useSession();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const { userDetails, session } = useSessionStore((state) => state);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const {
    data: userProfileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ["useDataforProfile", userId],
    queryFn: async () => {
      const url =
        userId === userDetails.id
          ? `${backendUrl}/me`
          : `${backendUrl}/userDetails/${userId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${userSession?.user.token}` },
      });
      return response.data;
    },
    enabled: !!userId && !!userSession?.user.token,
  });

  const {
    data: okrData,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["okrForUser", userId],
    enabled: !!userId && !!userSession?.user.token,
    queryFn: async () => {
      const response = await axios.post(
        `${backendUrl}/templates/getOkrForUser`,
        { id: userId, admin: true, sessionId: session?.id },
        {
          headers: { Authorization: `Bearer ${userSession?.user.token}` },
        }
      );
      return response.data;
    },
  });

  const totalOKRs = okrData?.data || [];

  const finishedOKRs = totalOKRs.filter((obj: any) => obj.progress === 100);
  const badOKRs = totalOKRs.filter((obj: any) => obj.progress === 0);
  const inProgressOKRs = totalOKRs.filter((obj: any) => obj.progress > 0 && obj.progress < 100);

  const cardsData = [
    {
      iconSrc: "/main/target.png",
      title: "Total OKR",
      count: totalOKRs.length,
      description: "",
    },
    {
      iconSrc: "/employee/active.png",
      title: "OKR Finished",
      count: finishedOKRs.length,
      description: "",
    },
    {
      iconSrc: "/main/smiley.png",
      title: "OKR On Progress",
      count: inProgressOKRs.length,
      description: "",
    },
    {
      iconSrc: "/user-profiles/redflag.png",
      title: "OKR Bad Performance",
      count: badOKRs.length,
      description: "",
    },
  ].map((card) => ({ ...card, loading: isLoading }));


  if (profileLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        Loading...
      </div>
    );
  if (profileError) return <p>Error fetching profile</p>;
  if (!userProfileData) return <p>No profile data available main</p>;

  return (
    <div>
      <div className="mt-4 ml-3 mb-3 flex items-center bg-white">
        <div className="w-10 h-10 ">
          <Avatar>
            <AvatarImage
              className="h-10 w-10"
              src={userProfileData?.data?.avatar}
              alt={`${userProfileData?.data?.name}'s avatar`}
            />
            <AvatarFallback>
              {userProfileData?.data?.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="ml-4 flex flex-col">
          <h1 className="font-bold text-lg">{userProfileData?.data?.name}</h1>

          <div className="grid grid-cols-5 gap-8 mt-2">
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-black">{userProfileData?.data?.email}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400">Job Title</p>
              <p className="text-sm text-black">
                {userProfileData?.data?.designation}
              </p>
            </div>

            {userProfileData?.data?.manager?.name && (
              <div>
                <p className="text-xs text-gray-400">Report To</p>
                <p className="text-sm text-black">{userProfileData.data.manager.name}</p>
              </div>
            )}

            {userProfileData?.data?.department?.name && (
              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="text-sm text-black">{userProfileData.data.department.name}</p>
              </div>
            )}

            {userProfileData?.data?.team?.name && (
              <div>
                <p className="text-xs text-gray-400">Team</p>
                <p className="text-sm text-black">{userProfileData.data.team.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Tabs defaultValue="tab-1">
        <div className="mt-2"></div>
        <hr></hr>
        <TabsList className="h-auto rounded-none border-b border-border-full bg-transparent p-0">
          <TabsTrigger
            value="tab-1"
            className="relative flex-col rounded-none px-4 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            OKR Achievement
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="relative flex-col rounded-none px-4 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Check-Ins
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="relative flex-col rounded-none px-4 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            1 on 1
          </TabsTrigger>
          <TabsTrigger
            value="tab-4"
            className="relative flex-col rounded-none px-4 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Performance Review
          </TabsTrigger>
          <TabsTrigger
            value="tab-5"
            className="relative flex-col rounded-none px-4 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Initiative & Task
          </TabsTrigger>
          <TabsTrigger
            value="tab-6"
            className="relative flex-col rounded-none px-4 py-2 text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
          >
            Recognition
          </TabsTrigger>
        </TabsList>
        <hr></hr>
        <TabsContent value="tab-1">
          <div className="grid grid-cols-4 gap-6 ml-3 mr-3 px-2 py-4">
            {cardsData?.map((card, index) => (
              <InfoCard
                key={index}
                iconSrc={card.iconSrc}
                title={card.title}
                count={card.count}
                description={card.description}
                loading={card.loading}
              />
            ))}
          </div>
          
        </TabsContent>
        <TabsContent value="tab-2">
          <div className="px-6 py-2">
            <UserTemplateTables user={userProfileData?.data} type="checkIn" />
          </div>
        </TabsContent>
        <TabsContent value="tab-3">
          <div className="px-6 py-2">
            <UserTemplateTables user={userProfileData?.data} type="oneOnOne" />
          </div>
        </TabsContent>
        <TabsContent value="tab-4">
          <div className="px-6 py-2">
            <UserTemplateTables user={userProfileData?.data} type="performance" />
          </div>
        </TabsContent>
        <TabsContent value="tab-5">
          
        </TabsContent>
        <TabsContent value="tab-6">
          <UserRecognition />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
