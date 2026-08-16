"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useSessionStore from "@/store/sessionStore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { V3Button } from "@/components/v3/V3Button";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const Page = () => {
  const [value, setValue] = useState<string>("");
  const storedEmail = useSessionStore.getState().email;
  const setotpSession = useSessionStore((state) => state.setotpSession);
  const router = useRouter();
  const { toast } = useToast();

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/otp/verify`, {
        email: storedEmail,
        otp: value,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const { token } = data.data;
      setotpSession(token);
      toast({ title: "OTP Validation Successful", description: "Redirecting to Change Password Page" });
      router.push("/auth/new-password");
    },
    onError: () => {
      toast({ title: "OTP Validation Failed", description: "Enter Valid OTP" });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/otp/send`, {
        email: storedEmail,
        reason: "reset_pass",
      });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "OTP Resent Successfully", description: "Check your mail" });
    },
    onError: () => {
      toast({ title: "Failed to send OTP", description: "Try again later" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    verifyOtpMutation.mutate();
  };

  const handleResend = () => {
    resendOtpMutation.mutate();
  };

  const slots = [0, 1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OTP Verification</h1>
          <p className="text-slate-400 text-sm mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Custom OTP input - 6 individual digit boxes */}
            <div className="flex justify-center gap-2">
              {slots.map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={value[i] || ""}
                  onChange={(e) => {
                    const char = e.target.value.replace(/\D/, "");
                    const arr = value.split("");
                    arr[i] = char;
                    const newVal = arr.join("").slice(0, 6);
                    setValue(newVal);
                    if (char && i < 5) {
                      const next = document.getElementById(`otp-slot-${i + 1}`);
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !value[i] && i > 0) {
                      const prev = document.getElementById(`otp-slot-${i - 1}`);
                      prev?.focus();
                    }
                  }}
                  id={`otp-slot-${i}`}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-white/10 border-2 border-white/20 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              ))}
            </div>

            <p className="text-center text-xs text-slate-400">
              {value === "" ? "Enter the verification code" : `${6 - value.length} digits remaining`}
            </p>

            <V3Button type="submit" isLoading={verifyOtpMutation.isPending} className="w-full" size="lg">
              {!verifyOtpMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
              Verify Code
            </V3Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors disabled:opacity-50"
              onClick={handleResend}
              disabled={resendOtpMutation.isPending}
            >
              {resendOtpMutation.isPending ? "Resending..." : "Resend"}
            </button>
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