"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useSessionStore from "@/store/sessionStore";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { V3Button } from "@/components/v3/V3Button";

interface FormData {
  email: string;
}

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const Page = () => {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const setEmailInStore = useSessionStore((state) => state.setEmail);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${backendUrl}/otp/send`, {
        email: data.email,
        reason: "reset_pass",
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      setEmailInStore(variables.email);
      toast({ title: "OTP Sent Successfully", description: "Check your mail" });
      router.push("/auth/otp");
    },
    onError: () => {
      toast({ title: "OTP Sent Failed", description: "Enter Valid Email Address" });
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    sendOtpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Password Recovery</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email to receive a reset code</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs">{errors.email.message}</p>}
            </div>

            <V3Button
              type="submit"
              isLoading={sendOtpMutation.isPending}
              className="w-full"
              size="lg"
            >
              {!sendOtpMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
              Send Reset Code
            </V3Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Remember your password?{" "}
            <a href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign In
            </a>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © SecureXAi Corp 2024. All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Page;