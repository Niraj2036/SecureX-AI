"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import FormBuilder from "./formbuilder";
import GroupCheckin from "./group-checkin";
import Image from "next/image";
import React from "react";
import axios from "axios";
import profile from "../../../public/okr/feedback/profile.png";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import UserTemplateTables from "./userTemplateTables";

const SelfCheckin = ({ id }: { id: string }) => {
  const { data: userSession } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const { data: userProfileData, isLoading, error } = useQuery({
    queryKey: ["userProfile", id],
    queryFn: async () => {
      if (!id || !userSession?.user?.token) return null;
      const response = await axios.get(`${backendUrl}/userDetails/${id}`, {
        headers: { Authorization: `Bearer ${userSession.user.token}` },
      });
      return response.data;
    },
    enabled: !!id && !!userSession?.user?.token, // Prevents unnecessary requests
  });

  return (
    <div className="text-left px-4 border-none">
      <h1 className="text-black text-lg  shadow-none py-2 font-bold">Check-Ins</h1>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">
              Failed to load user data.
            </p>
          ) : (
            <UserTemplateTables user={userProfileData?.data} type="checkIn" />
          )}
    </div>
  );
};

export default SelfCheckin;
