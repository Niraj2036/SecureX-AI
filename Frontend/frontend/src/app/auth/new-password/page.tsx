"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/sessionStore";
import { useToast } from "@/hooks/use-toast";
import { V3Button } from "@/components/v3/V3Button";

const Page = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const router = useRouter();
  const { toast } = useToast();
  const storedotpSession = useSessionStore.getState().otpSession;

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/otp/reset-password`, {
        newPassword: password,
        token: storedotpSession,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Password Changed Successfully", description: "Redirecting to Login page" });
      router.push("/auth/login");
    },
    onError: () => {
      toast({ title: "Password Change failed", description: "Try again Later" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match" });
      return;
    }
    resetPasswordMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600 shadow-lg shadow-amber-500/30 mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Password</h1>
          <p className="text-slate-400 text-sm mt-1">For your security, this will log you out of all devices</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full h-10 pl-9 pr-10 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <V3Button type="submit" isLoading={resetPasswordMutation.isPending} className="w-full" size="lg">
              {!resetPasswordMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
              {resetPasswordMutation.isPending ? "Resetting Password..." : "Create New Password"}
            </V3Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-amber-500 font-semibold hover:text-amber-400 transition-colors">
              Create Account
            </Link>
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