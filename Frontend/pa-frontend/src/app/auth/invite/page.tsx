"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { V3Button } from "@/components/v3/V3Button";

const AcceptInvitePage = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [showOtpPage, setShowOtpPage] = useState(false);
    const [showSetPassWord, setShowSetPassWord] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [value, setValue] = useState("");
    const [userEmail, setUserEmail] = useState("")
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [otpToken, setOtpToken] = useState("");
    const router = useRouter();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${backendUrl}/otp/reset-password`, {
                newPassword: password,
                token: otpToken,
            });
            return response.data;
        },
        onSuccess: () => {
            toast({ title: "Password Changed Successfully", description: "Redirecting to Login page" });
            router.push("/auth/login");
        },
        onError: (error: Error) => {
            toast({ title: "Password Change failed", description: "Try again Later" });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ title: "Both Passwords must be Same" });
            return;
        }
        resetPasswordMutation.mutate();
    };

    const sendOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.get(`${backendUrl}/otp/send-invite-otp`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        },
        onSuccess: (response: any) => {
            const email = response.data.email;
            setUserEmail(email);
            toast({ title: "OTP Sent Successfully", description: `Check your mail: ${email}`, duration: 3000 });
        },
        onError: (error: any) => {
            toast({ title: "OTP Sent Failed", description: `Error: ${error.message}`, duration: 3000 });
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${backendUrl}/otp/verify`, {
                email: userEmail,
                otp: value,
            });
            return response.data;
        },
        onSuccess: (data) => {
            const { token: tok } = data.data;
            setOtpToken(tok);
            toast({ title: "Otp Verified", description: "Otp Verification successful", duration: 3000 });
            setShowOtpPage(false);
            setShowSetPassWord(true);
        },
        onError: () => {
            toast({ title: "Otp Not Verified", description: "Otp Verification Failed", duration: 3000 });
        },
    });

    const handleVerifyClick = (event: any) => {
        event.preventDefault();
        setShowOtpPage(true);
        sendOtpMutation.mutate();
    };

    const handleResend = () => {
        sendOtpMutation.mutate();
    };

    const slots = [0, 1, 2, 3, 4, 5];

    const authCardClass = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl";
    const bgClass = "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4";
    const inputClass = "w-full h-10 pl-9 pr-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

    if (showOtpPage) {
        return (
            <div className={bgClass}>
                <div className="relative w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
                            <ShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">OTP Verification</h1>
                        <p className="text-slate-400 text-sm mt-1">Enter the 6-digit code sent to {userEmail}</p>
                    </div>
                    <div className={authCardClass}>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); verifyOtpMutation.mutate(); }}>
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
                                            setValue(arr.join("").slice(0, 6));
                                            if (char && i < 5) document.getElementById(`invite-otp-${i + 1}`)?.focus();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !value[i] && i > 0) document.getElementById(`invite-otp-${i - 1}`)?.focus();
                                        }}
                                        id={`invite-otp-${i}`}
                                        className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-white/10 border-2 border-white/20 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    />
                                ))}
                            </div>
                            <V3Button type="submit" isLoading={verifyOtpMutation.isPending} className="w-full" size="lg">
                                {!verifyOtpMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
                                Verify Code
                            </V3Button>
                        </form>
                        <p className="text-center text-slate-400 text-sm mt-5">
                            Didn&apos;t receive?{" "}
                            <button type="button" className="text-indigo-400 font-semibold hover:text-indigo-300" onClick={handleResend} disabled={sendOtpMutation.isPending}>
                                {sendOtpMutation.isPending ? "Resending..." : "Resend"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (showSetPassWord) {
        return (
            <div className={bgClass}>
                <div className="relative w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
                            <Lock className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Set Your Password</h1>
                        <p className="text-slate-400 text-sm mt-1">Create a strong password for your account</p>
                    </div>
                    <div className={authCardClass}>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 block">New Password <span className="text-rose-400">*</span></label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Enter password"
                                        className={`${inputClass} pr-10`}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                                        {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 block">Confirm Password <span className="text-rose-400">*</span></label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Confirm password"
                                        className={`${inputClass} pr-10`}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <V3Button type="submit" isLoading={resetPasswordMutation.isPending} className="w-full" size="lg">
                                {!resetPasswordMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
                                Set Password
                            </V3Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={bgClass}>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Accept Invitation</h1>
                    <p className="text-slate-400 text-sm mt-1">Join your organization by verifying your invitation</p>
                </div>

                <div className={authCardClass}>
                    {!token && (
                        <p className="text-rose-400 text-center mb-4 text-sm">No invitation token found in the URL.</p>
                    )}

                    <form className="space-y-5" onClick={handleVerifyClick}>
                        <V3Button type="submit" isLoading={sendOtpMutation.isPending} className="w-full" size="lg">
                            {!sendOtpMutation.isPending && <ArrowRight className="h-4 w-4 mr-1" />}
                            Accept & Verify Invitation
                        </V3Button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-5">
                        Don&apos;t have an account?{" "}
                        <a href="/auth/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                            Create Account
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

export default AcceptInvitePage;