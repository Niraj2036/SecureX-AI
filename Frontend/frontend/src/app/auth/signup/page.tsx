"use client";

import { Wizard, useWizard } from "react-use-wizard";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/signupStore";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff, Building2, User, Mail, Globe, Lock, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import Employselect from "@/components/auth/employselect";
import IndustrySelect from "@/components/auth/industryselect";
import RoleSelect from "@/components/auth/roleselect";
import { V3Button } from "@/components/v3/V3Button";

const formSchema = z.object({
  firstName: z.string().min(1, "Name is required.").max(50),
  email: z.string().email("Invalid email address."),
  companyName: z.string().min(1, "Company Name is required.").max(100),
  companyWebsite: z.string().min(1, "Company Website is required."),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type FormData = z.infer<typeof formSchema>;

const Page = () => (
  <Wizard>
    <Step1 />
    <Step2 />
  </Wizard>
);

const bgClass = "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 p-4";
const cardClass = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl";
const inputClass = "w-full h-10 pl-9 pr-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all";

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
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: name || "", email: email || "", companyName: companyName || "", companyWebsite: companyWebsite || "", password: password || "" },
  });

  const onSubmit = (data: FormData) => {
    setName(data.firstName);
    setemail(data.email.toLowerCase());
    setcompanyname(data.companyName);
    setcompanywebsite(data.companyWebsite);
    setPassword(data.password);
    nextStep();
  };

  return (
    <div className={bgClass}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600 shadow-lg shadow-amber-500/30 mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h1>
          <p className="text-slate-400 text-sm mt-1">Step 1 of 2 — Company & personal details</p>
        </div>

        <div className={cardClass}>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Full Name <span className="text-rose-400">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input placeholder="Enter your name" {...register("firstName")} className={inputClass} />
              </div>
              {errors.firstName && <p className="text-rose-400 text-xs">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Work Email <span className="text-rose-400">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input placeholder="you@company.com" {...register("email")} className={inputClass} />
              </div>
              {errors.email && <p className="text-rose-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Company Name <span className="text-rose-400">*</span></label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input placeholder="Acme Corp" {...register("companyName")} className={inputClass} />
              </div>
              {errors.companyName && <p className="text-rose-400 text-xs">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Company Website <span className="text-rose-400">*</span></label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input placeholder="https://acme.com" {...register("companyWebsite")} className={inputClass} />
              </div>
              {errors.companyWebsite && <p className="text-rose-400 text-xs">{errors.companyWebsite.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Password <span className="text-rose-400">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" {...register("password")} className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs">{errors.password.message}</p>}
            </div>

            <V3Button type="submit" className="w-full" size="lg">
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </V3Button>

            <p className="text-center text-slate-400 text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="text-amber-500 font-semibold hover:text-amber-400">Sign In</a>
            </p>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">© SecureXAi. Copyright 2024. All Rights Reserved</p>
      </div>
    </div>
  );
};

const Step2 = () => {
  const { previousStep } = useWizard();
  const { toast } = useToast();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const { name: storedname, email: storedemail, companyName: storedcompanyname, website: storedwebsite, designation: storeddesignation, industry: storedindustry, employeeSize: storedemployeesize, password: storedpassword } = useSessionStore.getState();

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/otp/send`, { email: storedemail, reason: "verify_user" });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "OTP Sent Successfully", description: "Check your email to verify your account." });
      router.push("/auth/verify-otp");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message?.join(", ") || error?.response?.data?.message || "An error occurred.";
      toast({ title: "Signup Failed", description: errorMessage, duration: 3000, variant: "destructive" });
    },
  });

  const submitsignupMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/users/register`, {
        name: storedname, phoneCode: "IN_91", mobile: "1234567890", email: storedemail,
        companyname: storedcompanyname, website: storedwebsite, designation: storeddesignation,
        industry: storedindustry, employeeSize: storedemployeesize, password: storedpassword, userLimit: 100,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Signup Successful", description: "Please verify your email to complete signup.", duration: 3000 });
      sendOtpMutation.mutate();
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message;
      const message = Array.isArray(errMsg) ? errMsg.join(", ") : errMsg || "Something went wrong. Please try again.";
      toast({ title: "Signup Failed", description: message, duration: 3000, variant: "destructive" });
    },
  });

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!storedpassword || storedpassword.length < 8) {
      toast({ title: "Invalid Password", description: "Password must be at least 8 characters long.", duration: 3000, variant: "destructive" });
      return;
    }
    submitsignupMutation.mutate();
  };

  return (
    <div className={bgClass}>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600 shadow-lg shadow-amber-500/30 mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Organization Setup</h1>
          <p className="text-slate-400 text-sm mt-1">Step 2 of 2 — Configure your organization</p>
        </div>

        <div className={cardClass}>
          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="space-y-2">
              <RoleSelect />
            </div>
            <div className="space-y-2">
              <IndustrySelect />
            </div>
            <div className="space-y-2">
              <Employselect />
            </div>

            <div className="flex gap-3 pt-2">
              <V3Button type="button" variant="outline" onClick={previousStep} className="flex-1" size="lg">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </V3Button>
              <V3Button type="submit" isLoading={submitsignupMutation.isPending} className="flex-1" size="lg">
                {!submitsignupMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
                {submitsignupMutation.isPending ? "Signing Up..." : "Sign Up"}
              </V3Button>
            </div>

            <p className="text-center text-slate-400 text-sm">
              Already have an account?{" "}
              <a href="/auth/login" className="text-amber-500 font-semibold hover:text-amber-400">Sign In</a>
            </p>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">© SecureXAi. Copyright 2024. All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Page;