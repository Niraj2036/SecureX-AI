"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import React from "react";
import { Separator } from "@/components/ui/separator";
import bag from "../../../../../../public/settings/bag.png";
import pen from "../../../../../../public/settings/pen.png";
import target from "../../../../../../public/okr/target.png";
import ObjectivePermissions from "@/components/Permissions/ObjectivePermissions";
import CheckInPermissions from "@/components/Permissions/CheckInPermissions";
import OneOnOnePermissions from "@/components/Permissions/OneOnOnePerformance";
import PerformancePermissions from "@/components/Permissions/PerformancePermissions";
import { CalendarCheck, LineChart, Target, UserRound } from "lucide-react";

const Page = () => {
  const [activeTab, setActiveTab] = useState("Objective");

  return (
    <>
      <div className="flex p-4 bg-gray-100 min-h-screen">
        <div className="w-1/4 bg-white rounded-lg shadow p-4 mr-4">
          <h2 className="font-semibold text-lg pt-4">Profiles and Permission</h2>
          <Separator className="mt-4" />
          <br></br>
          <Button
            onClick={() => setActiveTab("Objective")}
            className={`bg-white w-full text-black rounded-lg py-2 justify-start ${activeTab === "Objective" ? "text-primary-400 bg-secondary-100" : ""
              } hover:bg-secondary-100 hover:text-primary-400`}
          >
            <Target className="w-5 h-5 mr-2" />
            Objective
          </Button>

          <Button
            onClick={() => setActiveTab("CheckIn")}
            className={`bg-white w-full text-black rounded-lg mt-2 py-2 justify-start ${activeTab === "CheckIn" ? "text-primary-400 bg-secondary-100" : ""
              } hover:bg-secondary-100 hover:text-primary-400`}
          >
            <CalendarCheck className="w-5 h-5 mr-2" />
            CheckIn
          </Button>

          <Button
            onClick={() => setActiveTab("OneOnOne")}
            className={`bg-white w-full text-black rounded-lg mt-2 py-2 justify-start ${activeTab === "OneOnOne" ? "text-primary-400 bg-secondary-100" : ""
              } hover:bg-secondary-100 hover:text-primary-400`}
          >
            <UserRound className="w-5 h-5 mr-2" />
            OneOnOne
          </Button>

          <Button
            onClick={() => setActiveTab("Performance")}
            className={`bg-white w-full text-black rounded-lg mt-2 py-2 justify-start ${activeTab === "Performance" ? "text-primary-400 bg-secondary-100" : ""
              } hover:bg-secondary-100 hover:text-primary-400`}
          >
            <LineChart className="w-5 h-5 mr-2" />
            Performance
          </Button>

        </div>

        <div className="flex-grow bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <h1 className="font-semibold text-xl text-slate-600">Manage Permissions </h1>
            </span>
            <div className="flex items-center space-x-2">
               
            </div>
          </div>
          <Separator className="mt-4 "></Separator>
          {
            activeTab === "Objective" && (
              <ObjectivePermissions />
            )
          }
          {
            activeTab === "CheckIn" && (
              <CheckInPermissions />
            )
          }
          {
            activeTab === "OneOnOne" && (
              <OneOnOnePermissions />
            )
          }
          {
            activeTab === "Performance" && (
              <PerformancePermissions />
            )
          }
        </div>
      </div>
    </>
  );
};

export default Page;
