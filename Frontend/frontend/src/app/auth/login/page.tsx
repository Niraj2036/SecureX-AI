"use client";

import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight } from "lucide-react";
import { BASE_URL } from "@/constant";
import Link from "next/link";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { V3Button } from "@/components/v3/V3Button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const router = useRouter();
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ email, password }: z.infer<typeof loginSchema>) => {
      const res = await axios.post(`${BASE_URL}/users/login`, {
        email: email.toLowerCase(),
        password: password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      signIn("credentials", {
        token: data.data.access_token,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error?.response?.data?.message || "Invalid credentials provided",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => mutate(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-4">
            <Sparkles className="h-3 w-3" /> SecureX AI V3
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to access your organization dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  {...register("email")}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs">{errors.password.message}</p>}
            </div>

            <V3Button type="submit" isLoading={isPending} className="w-full" size="lg">
              {!isPending && <ArrowRight className="h-4 w-4 mr-1" />}
              {isPending ? "Signing in..." : "Sign In"}
            </V3Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-transparent px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full h-10 rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Account
          </button>

          <p className="text-center text-slate-400 text-sm mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">© SecureXAi Corp 2024. All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Page;