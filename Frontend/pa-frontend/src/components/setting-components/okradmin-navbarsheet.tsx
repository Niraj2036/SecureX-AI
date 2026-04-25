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
import plus from "../../../public/settings/plus.png";
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
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryClient } from "@/app/providers";
import { toast } from "@/hooks/use-toast";
import useSessionStore from "@/store/signupStore";

const createObjectiveSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  scope: z.enum(["Company", "Department", "Team"]),
  employee : z.string().optional(),
  deadlineLevel: z.string().min(1, "Deadline level is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  deadlineDate: z.date().optional(),
  parentNode: z.string().min(1, "Parent Node is required"),
});

interface ParentNodeTypeMap {
  id: string;
  parentId: string | null;
  name: string;
  leadId: string;
  type: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
  };
  parent: null | ParentNodeTypeMap;
  users: Array<{
    id: string;
    name: string;
    avatar: string | null;
    email: string;
  }>;
}


interface EmployeeTypeMap {
  id: string;
  avatar: string | null;
  tenantId: string;
  name: string;
  email: string;
  phoneCode: string;
  mobile: string;
  teamId: string | null;
  managerId: string | null;
  joiningDate: string | null;
  designation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  data: unknown;
  role: string
}


const Adminsheet = ({ type = "all" }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const { data: session, status } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState(type==="all" ? "Department" : type.charAt(0).toUpperCase() + type.slice(1));
  const form = useForm<z.infer<typeof createObjectiveSchema>>({
    resolver: zodResolver(createObjectiveSchema),
    defaultValues: {
      title: "",
      description: "",
      scope: "Company",
      employee: "",
      deadlineLevel: "",
      startDate: undefined,
      endDate: undefined,
      deadlineDate: undefined,
      parentNode: "",
    },
  });

  const {data : companyDetails ,isLoading:isCompanyLoading, isError:isCompanyError}=useQuery({
    queryKey:["companyDetails",session?.user?.token],
    queryFn:async()=>{
      const response=await axios.get(`${backendUrl}/company`,{
        headers:{ Authorization: `Bearer ${session?.user.token}`},
      });
      console.log(response.data, "rishi data consoled");
      return response.data;
    }
  });


  const { data: parentNode, isLoading: isParentNodeLoading, isError: isParentNodeError } = useQuery({
    queryKey: ["parentNode", session?.user?.token, selectedScope],
    queryFn: async () => {
      const response = await axios.get(`${backendUrl}/teams/dept`, {
        headers: { Authorization: `Bearer ${session?.user?.token}` },
      });
  
      console.log("Full API Response:", response.data);
  
      if (response.data.statusCode === 200) {
        const departments = response.data.data.data; 
  
        // console.log("Departments Data:", departments);
  
        const filteredDepartments = departments
          .filter((node: any) => node.type === "department")
          .map((node: any) => ({
            id: node.id,
            parentId: node.parentId,
            name: node.name,
            leadId: node.leadId,
            type: node.type,
            tenantId: node.tenantId,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
            lead: node.lead,
            parent: node.parent,
            users: node.users || [],
          }));
  
        // console.log("Filtered Departments:", filteredDepartments);
  
        return filteredDepartments;
      } else {
        throw new Error(response.data.message || "Failed to fetch parentNode");
      }
    },
    enabled: !!session?.user?.token,
  });
  

 
  const companyName = companyDetails?.data?.name;

  const handleSelectParentNode = (value: string) => {
    form.setValue("parentNode", value);
    console.log(form.getValues("parentNode"))
  };

  const queryClient=useQueryClient();
  const mutation=useMutation({
    mutationFn:async(data:z.infer<typeof createObjectiveSchema>)=>{
      const requestBodyWithForDepartment = {
        name: data.title as string,
        type: selectedScope.toLowerCase() as string,
      }
      const requestBodyWithForTeam = {
        name: data.title as string,
        parentId: form.getValues("parentNode"),
        type: selectedScope.toLowerCase() as string,
      }

      const requestBody= selectedScope==="Department" ? requestBodyWithForDepartment : requestBodyWithForTeam;

      const response=await axios.post(`${backendUrl}/teams`,requestBody,{
        headers: {
          Authorization: `Bearer ${session?.user?.token}`,
        },
      });
      console.log(response.data, "rishi data consoled");
    },
    onSuccess:()=>{
      toast({
        title:`${selectedScope} Created`,
        description:`${selectedScope} has been created successfully`,
        duration:3000
      })
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      form.reset();
      setSheetOpen(false);
    },
    onError:(error:any)=>{
      toast({
        title:`Failed to create ${selectedScope} `,
        description:error.message,
        duration:3000
      })
    }
  });
  const handleSubmit = () => {
    const values = form.getValues();
    const title = values.title?.trim();
    const parentNode = values.parentNode;
  
    if (!title || !parentNode) {
      toast({
        title: `Failed to create ${selectedScope}`,
        description: "Please fill out all required fields.",
        duration: 3000,
      });
      return;
    }
  
    console.log("Submitted data:", values);
    mutation.mutate(values);
  };

  // const Option= type == "all" ? ["Department","Team"] : [type];


  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <div className="flex">
          {(type == "department" || type == "all") && <Button className="bg-white text-slate-500 border hover:bg-secondary-200 flex items-center space-x-2">
            <Image src={plus} alt="plus" className="w-3" />
            <span>Department</span>
          </Button>}
          {(type == "team" || type == "all") && <Button className="bg-white text-slate-500 border hover:bg-secondary-200 flex items-center space-x-2">
            <Image src={plus} alt="plus" className="w-3" />
            <span>Team</span>
          </Button>}
        </div>
      </SheetTrigger>

      <SheetContent className="space-y-6">
        <SheetHeader>
          <SheetTitle>Add to Organization</SheetTitle>
        </SheetHeader>

        {type === "all" && <div className="flex flex-row w-full gap-2 justify-between items-center">
          {["Department", "Team"].map((scope) => (
            <Button
              key={scope}
              className="w-full rounded-lg"
              variant={selectedScope === scope ? "default" : "outline"}
              onClick={() => setSelectedScope(scope)}
            >
              {scope}
            </Button>
          ))}
        </div>}

        <Form {...form} >
          <form
            onSubmit={form.handleSubmit((data) => {
              console.log("Submitted data:", data); 
            })}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col space-y-1">
              <Label className="inline-flex items-center">
                {selectedScope} Name
                <Required />
              </Label>
              <Input
                required
                min={"2"}
                placeholder={`Enter ${selectedScope} name`}
                {...form.register("title")}
              />
              <FormMessage />
            </div>


            <FormFieldWrapper
              label="Parent Node"
              placeholder="Select Parent Node"
              options={selectedScope === "Department" ? [{ id: "company1", name: companyName }]: parentNode}
              onValueChange={handleSelectParentNode}
              value={form.watch("parentNode")}
            />

            <span className="mt-64"></span>
            <hr />
            <div className="flex justify-between">
              <Button
                className="w-1/2 border border-primary-500 bg-white text-primary-500 hover:bg-slate-100"
                type="button"
                onClick={() => console.log("Cancelled")} 
              >
                Cancel
              </Button>
              <Button className="w-1/2 ml-4" type="submit" onClick={handleSubmit}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

const FormFieldWrapper = ({
  label,
  placeholder,
  options,
  onValueChange,
  value,
  formatOption = (opt) => opt.name,
  isLoading = false,
  isError = false,
}: {
  label: string;
  placeholder: string;
  options: any[];
  onValueChange: (value: string) => void;
  value: string;
  formatOption?: (opt: any) => string;
  isLoading?: boolean;
  isError?: boolean;
}) => (
  <FormField
    name={label.toLowerCase().replace(" ", "")}
    render={() => (
      <FormItem className="col-span-2">
        <FormLabel className="inline-flex gap-2">
          {label}
          <Required />
        </FormLabel>
        <FormControl>
          <div className="space-y-2">
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{placeholder}</SelectLabel>
                  {isLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : isError ? (
                    <SelectItem value="error">Error loading options</SelectItem>
                  ) : (
                    options?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {formatOption(option)}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default Adminsheet;
