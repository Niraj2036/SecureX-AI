"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar } from "./ui/calendar";
import dateIcon from "../../public/okr/calendar.png";
import person from "../../public/okr/person.png";
import team from "../../public/okr/team.png";
import company from "../../public/okr/company.png";
import moment from "moment";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const FilterComponent = () => {
  const [selectedView, setSelectedView] = useState("My Individual OKR");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleViewChange = (view: string) => {
    setSelectedView(view);
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <Card className="w-full  border-none">
      <CardHeader>
        <CardTitle className="text-base text-black">Filter</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Dropdown for selecting OKR type */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center w-full">
                <div className="flex items-center justify-start w-full">
                  <Image src={person} alt="person" className="w-6 h-6 mr-2" />
                  <div className="truncate">{selectedView}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 p-2 rounded-md bg-white shadow-lg border">
              {[
                { label: "My Individual OKR", icon: person },
                { label: "Team OKR", icon: team },
                { label: "Company OKR", icon: company },
              ].map((option) => (
                <DropdownMenuItem
                  key={option.label}
                  className="px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
                  onClick={() => handleViewChange(option.label)}
                >
                  <div className="flex items-center">
                    <Image
                      src={option.icon}
                      alt={option.label}
                      className="w-5 h-5 mr-2"
                    />
                    {option.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown for selecting date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center w-full">
                <div className="flex items-center justify-start w-full">
                  <Image
                    src={dateIcon}
                    alt="calendar"
                    className="w-6 h-6 mr-2"
                  />
                  {selectedDate
                    ? moment(selectedDate).format("DD/MM/YYYY")
                    : "Date"}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterComponent;
