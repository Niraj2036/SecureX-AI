"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import Image from "next/image";
import add from "../../../public/settings/add.png";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import Required from "../ui/required-icon";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import useSessionStore from "@/store/sessionStore";
import { m } from "framer-motion";

const inviteUserSchema = z.object({
  Name: z.string().nonempty("Name is required"),
  emailAddress: z.string().email("Invalid email address"),
  designation: z.string().nonempty("Designation is required"),
  mobile: z.string().optional(),
  organizationUnit: z.string().optional(),
  team: z.string().optional(),
  reportingManager: z.string().nonempty("Reporting Manager is required"),
  isAdmin: z.enum(["yes", "no"]).optional(), // New field for admin status
  isTeamLead: z.enum(["yes", "no"]).optional(), // New field for admin status
  isDeptHead: z.enum(["yes", "no"]).optional(), // New field for admin status
});

interface InviteUserProps {
  setActive: (active: any) => void
  setInactive: (active: any) => void
}
const Inviteusers = ({children}:{children:React.ReactNode}) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const {userRole}=useSessionStore((state)=>state)
  const form = useForm({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      Name: "",
      emailAddress: "",
      designation: "",
      organizationUnit: "",
      mobile: "",
      team: "",
      reportingManager: "",
      isAdmin: "no",
      isTeamLead: "no",
      isDeptHead: "no",
    },
  });

  const onSubmit = (data: any) => {
    mutate(data);
  };

  const { mutate, isError,isPending } = useMutation({
    mutationFn: async (formData: z.infer<typeof inviteUserSchema>) => {
      if (status !== "authenticated") {
        throw new Error("User is not authenticated.");
      }

      const requestBody = {
        name: formData.Name || "Hardcoded Name",
        email: formData.emailAddress || "HardcodedEmail@gmail.com",
        phoneCode: "IN_91",
        mobile: "1234567890",
        designation: formData.designation || "Hardcoded Designation",
        role: formData.isAdmin === "yes" ? "admin" : "employee",
        teamId: formData.team,
        orgUnit: formData.organizationUnit,
        managerId: formData.reportingManager,
        isTeamLead: formData.isTeamLead === "yes",
        isDeptHead: formData.isDeptHead === "yes",
        isAdmin: formData.isAdmin === "yes",
      };

      console.log(requestBody)

      const response = await axios.post(
        `${backendUrl}/users/invite`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );
      console.log("response", response);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "User invited successfully",
        description: "User has been invited successfully.",
        duration:3000
      });
      console.log("User invited successfully:", data);
    },
    onError: (error:any) => {
      console.error("Error inviting user:", error);
      const errorMessage = error.response?.data?.message || "There was an error inviting the user.";
      toast({
        title: "Error inviting user",
        description: errorMessage,
        duration: 3000,
      });
    }
    
  });
  const { data: departmentData, isLoading } = useQuery({
    queryKey: ["department"],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams/dept`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      console.log(response.data, "team data consoled");
      return response.data.data;
    }
  });

  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ["teams", form.getValues("organizationUnit"),selectedDepartment],
    queryFn: async () => {
      const departmentId = form.getValues("organizationUnit");
      if (!departmentId) return [];
      const response = await axios.get(`${backendUrl}/teams/teams/${departmentId}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      console.log(response.data, "team data consoled");
      return response.data.data;
    },
    enabled: !!form.getValues("organizationUnit"),
  });
  const { data: userData = [], isError: isUserDataError, isLoading: isUserDataLoading } = useQuery({
    queryKey: ["users", status],
    enabled: status === "authenticated",
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/users`, {
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });

      console.log(response.data);
      return response.data.data;
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>

      <SheetContent className="">
        <SheetHeader>
          <SheetTitle>Invite User</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Name <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Email Address <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mobile number..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Designation
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Designation name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizationUnit"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">Organization Unit</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value); // Update the organization unit value in the form
                          setSelectedDepartment(value)
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Organization Units</SelectLabel>
                          {departmentData?.data
                            ?.filter((option: any) => option.type === "department")
                            .map((option: any) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">Team <Required /></FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Teams</SelectLabel>
                          {teamData?.data.map((option: any) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reportingManager"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Reporting Manager <Required />
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Reporting Manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Reporting Managers</SelectLabel>
                          {userData?.data?.map((option: any) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {userRole=== "admin" && <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Set as Admin?
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        setSelectedRole(value === "yes" ? "isAdmin" : null);
                        field.onChange(value);
                      }}
                      value={field.value}
                      disabled={!!selectedRole && selectedRole !== "isAdmin"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Admin Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Admin Status</SelectLabel>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />}

            {/* isTeamLead Field */}
            <FormField
              control={form.control}
              name="isTeamLead"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Set as Team Lead?
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        setSelectedRole(value === "yes" ? "isTeamLead" : null);
                        field.onChange(value);
                      }}
                      value={field.value}
                      disabled={!!selectedRole && selectedRole !== "isTeamLead"} // Disable if another role is selected
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Team Lead Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Team Lead Status</SelectLabel>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* isDeptHead Field */}
            <FormField
              control={form.control}
              name="isDeptHead"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="inline-flex gap-2">
                    Set as Department Head?
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        setSelectedRole(value === "yes" ? "isDeptHead" : null);
                        field.onChange(value);
                      }}
                      value={field.value}
                      disabled={!!selectedRole && selectedRole !== "isDeptHead"} // Disable if another role is selected
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department Head Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Department Head Status</SelectLabel>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <hr></hr>

            <div className="flex justify-between">
              <Button
                className="w-1/2 border border-primary-500 bg-white text-primary-500 hover:bg-slate-100"
                type="button"
              >
                Cancel
              </Button>
              <Button className="w-1/2 ml-4" type="submit" isLoading={isPending}>
                Invite
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default Inviteusers;
