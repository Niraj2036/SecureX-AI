"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wizard, useWizard } from "react-use-wizard";

import { Button } from "@/components/ui/button";
import Employselect from "@/components/auth/employselect";
import Image from "next/image";
import IndustrySelect from "@/components/auth/industryselect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RoleSelect from "@/components/auth/roleselect";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/signupStore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const logo = "/logo.svg";

const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "Name is required.")
    .max(50, "Name cannot exceed 50 characters."),
  email: z.string().email("Invalid email address."),
  companyName: z
    .string()
    .min(1, "Company Name is required.")
    .max(100, "Company Name cannot exceed 100 characters."),
  companyWebsite: z
    .string()
    .min(1, "Company Website is required."),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormData = z.infer<typeof formSchema>;

const Page = () => (
  <Wizard>
    <Step1 />
    <Step2 />
  </Wizard>
);

const Step1 = () => {
  const { nextStep } = useWizard();
  const { setName, name } = useSessionStore((state) => state);
  const setemail = useSessionStore((state) => state.setEmail);
  const setcompanyname = useSessionStore((state) => state.setCompanyName);
  const setcompanywebsite = useSessionStore((state) => state.setWebsite);
  const setPassword = useSessionStore((state) => state.setPassword);

  const email = useSessionStore((state) => state.email);
  const companyName = useSessionStore((state) => state.companyName);
  const companyWebsite = useSessionStore((state) => state.website);
  const password = useSessionStore((state) => state.password);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: name || "",
      email: email || "",
      companyName: companyName || "",
      companyWebsite: companyWebsite || "",
      password: password || "",
    },
  });

  // Update session store data on form submit
  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
    setName(data.firstName);
    setemail(data.email.toLowerCase());
    setcompanyname(data.companyName);
    setcompanywebsite(data.companyWebsite);
    setPassword(data.password);
    nextStep();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="absolute top-8">
        <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
      </div>

      <div className="w-full max-w-md">
        <Card className="border-gray-200">
          <CardHeader className="space-y-2">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Get Started!</h2>
              <p className="text-sm text-gray-500">
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 border rounded-full">
                1
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-teal-600">2</span>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid">
                <div className="space-y-2">
                  <Label>
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter your name"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="Enter your email" {...register("email")} />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter your company name here"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Company Website <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter your company website"
                  {...register("companyWebsite")}
                />
                {errors.companyWebsite && (
                  <p className="text-red-500 text-sm">
                    {errors.companyWebsite.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <Button className="w-full" type="submit">
                Next
              </Button>

              <p className="text-center text-sm">
                Have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-primary-500 font-semibold hover:underline"
                >
                  Login
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-4">
          &copy; SecureXAi. Copyright 2024. All Rights Reserved
        </p>
      </div>
    </div>
  );
};


const Step2 = () => {
  const { previousStep } = useWizard();
  const { toast } = useToast();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const {
    name: storedname,
    email: storedemail,
    companyName: storedcompanyname,
    website: storedwebsite,
    designation: storeddesignation,
    industry: storedindustry,
    employeeSize: storedemployeesize,
    password: storedpassword,
  } = useSessionStore.getState();

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/otp/send`, {
        email: storedemail,
        reason: "verify_user",
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent Successfully",
        description: "Check your email to verify your account.",
      });
      router.push("/auth/verify-otp");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message?.join(", ") ||
        error?.response?.data?.message ||
        "An error occurred.";
      console.error("Signup failed:", errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        duration: 3000,
        variant: "destructive",
      });
    },
  });

  const submitsignupMutation = useMutation({
    mutationFn: async () => {
      const signupData = {
        name: storedname,
        phoneCode: "IN_91",
        mobile: "1234567890",
        email: storedemail,
        companyname: storedcompanyname,
        website: storedwebsite,
        designation: storeddesignation,
        industry: storedindustry,
        employeeSize: storedemployeesize,
        password: storedpassword,
        userLimit: 100,
      };

      const response = await axios.post(`${backendUrl}/users/register`, signupData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Signup Successful",
        description: "Please verify your email to complete signup.",
        duration: 3000,
      });
      sendOtpMutation.mutate();
    },
    onError: (error: any) => {
      let message = "Something went wrong. Please try again.";

      if (error.response?.data?.message) {
        const errMsg = error.response.data.message;
        message = Array.isArray(errMsg) ? errMsg.join(", ") : errMsg;
      }

      toast({
        title: "Signup Failed",
        description: message,
        duration: 3000,
        variant: "destructive",
      });
    },
  });

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!storedpassword || storedpassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    submitsignupMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="absolute top-8">
        <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
      </div>

      <div className="w-full max-w-md">
        <Card className="border-gray-200">
          <CardHeader className="space-y-2">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Get Started!</h2>
              <p className="text-sm text-gray-500">
                Sign up now and integrate our system into your workflow.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 border rounded-full">
                2
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-teal-600">2</span>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="space-y-2">
                <RoleSelect></RoleSelect>
              </div>

              <div className="space-y-2">
                <IndustrySelect></IndustrySelect>
              </div>

              <div className="space-y-2">
                <Employselect></Employselect>
              </div>

              <div>
                <div className="flex gap-4">
                  <Button
                    className="w-full bg-white text-black border border-slate-300 hover:bg-gray-200"
                    type="button"
                    onClick={previousStep}
                  >
                    Back
                  </Button>
                  <Button className="w-full" type="submit" disabled={submitsignupMutation.isPending}>
                    {submitsignupMutation.isPending ? "Signing Up..." : "Sign Up"}
                  </Button>
                </div>
              </div>

              <p className="text-center text-sm">
                Have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-primary-500 font-semibold hover:underline"
                >
                  Login
                </a>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-4">
          &copy; SecureXAi. Copyright 2024. All Rights Reserved
        </p>
      </div>
    </div>
  );
};
export default Page;

