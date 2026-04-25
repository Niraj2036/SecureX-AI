import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import { Card } from "../ui/card";
import FormBuilder from "./formbuilder";
import Image from "next/image";
import React from "react";
import axios from "axios";
import profile from "/public/okr/feedback/profile.png";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const ProfileCard = () => {
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
  return (
    <div>
      <Card className="border-none ">
        <Card className="mt-4 px-2 mb-3  p-4 flex items-center bg-neutral-50 shadow-sm ">
          <div className="w-10 h-10 relative ">
            <Avatar>
              <AvatarImage
                src={userProfileData.data.avatar}
                alt={`${userProfileData.data.name}'s avatar`}
              />
              <AvatarFallback>
                {userProfileData.data.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="ml-4 flex flex-col">
            <h1 className="font-bold text-lg">{userProfileData.data.name}</h1>

            <div className="grid grid-cols-3 gap-8 mt-2">
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm text-black">
                  {userProfileData.data.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Job Title</p>
                <p className="text-sm text-black">
                  {userProfileData.data.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Report To</p>
                <p className="text-sm text-black">
                  {userProfileData.data?.manager?.name || "N/a"}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <FormBuilder from={"profile"} filled={false} type={"checkIn"} />
      </Card>
    </div>
  );
};

export default ProfileCard;
