"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { headers } from "next/headers";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const logo = "/logo.svg";

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
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };
    const router = useRouter()

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${backendUrl}/otp/reset-password`, {
                newPassword: password,
                token: otpToken,
            });
            return response.data;
        },
        onSuccess: () => {
            toast({
                title: "Password Changed Successfully",
                description: "Redirecting to Login page",
            });
            router.push("/auth/login");
        },
        onError: (error) => {
            toast({
                title: "Password Change failed",
                description: "Try again Later",
            });
            console.error("Error resetting password:", error.message);
        },
    });
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                title: "Both Passwords must be Same",
            });
            return;
        }
        resetPasswordMutation.mutate();
    };

    const handleVerifyClick = (event: any) => {
        event.preventDefault()
        setShowOtpPage(true);
        sendOtpMutation.mutate()

    };
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.post(`${backendUrl}/otp/verify`, {
                email: userEmail,
                otp: value,
            });
            return response.data;
        },
        onSuccess: (data) => {
            console.log("OTP verification successfull:", data);
            toast({
                title: "Otp Verified",
                description: "Otp Verification successfull",
                duration: 3000
            })
            const { token } = data.data;
            setOtpToken(token);
            setShowOtpPage(false)
            setShowSetPassWord(true);
        },
        onError: (error: Error) => {
            toast({
                title: "Otp Not Verified",
                description: "Otp Verification Failed",
                duration: 3000
            })
            console.error("OTP verification failed:", error.message);
        },
    });

    const handleOtpVerify = (event: any) => {
        event.preventDefault();
        verifyOtpMutation.mutate()
    };


    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const sendOtpMutation = useMutation({
        mutationFn: async () => {
            const response = await axios.get(`${backendUrl}/otp/send-invite-otp`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            return response.data;
        },
        onSuccess: (response: any) => {
            console.log("OTP sent successfully.");
            const email = response.data.email;
            setUserEmail(email)
            toast({
                title: "OTP Sent Successfully",
                description: `Check your mail: ${email}`,
                duration: 3000
            });
        },
        onError: (error: any) => {
            toast({
                title: "OTP Sent Failed",
                description: `Error: ${error.message}`,
                duration: 3000
            });
            console.error("Error sending OTP:", error.message);
        },
    });
    const handleResend = () => {
        sendOtpMutation.mutate(undefined, {
          onSuccess: () => {
            toast({
              title: "OTP Resent Successfully",
              description: "Check Your mail ",
            });
          },
          onError: (error) => {
            toast({
              title: "Failed to send OTP",
              description: "Try again later",
            });
            console.error("Error Response: aries", error);
          },
        });
      };

    if (showOtpPage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
                <div className="absolute top-8">
                    <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
                </div>

                <div className="w-full max-w-md px-6 py-8 bg-white border rounded-lg shadow-md">
                    <div className="flex flex-col items-center justify-center mb-4">
                        <h1 className="text-2xl font-semibold text-center">
                            OTP Verification
                        </h1>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm text-center">
                        Enter the OTP to verify your account.
                    </p>
                    <form className="space-y-6" onSubmit={handleOtpVerify}>
                        <div className="flex flex-col items-center space-y-4">
                            <InputOTP
                                maxLength={6}
                                value={value}
                                onChange={(value) => setValue(value)}
                            >
                                <InputOTPGroup className="flex justify-center items-center space-x-2">
                                    {[...Array(6)].map((_, index) => (
                                        <InputOTPSlot key={index} index={index} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>

                            <div className="text-center text-sm text-gray-600">
                                {value === "" ? (
                                    <>Enter the verification code.</>
                                ) : (
                                    <>Code entered: {value}</>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={verifyOtpMutation.isPending}
                        >
                            {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Didnâ€™t receive the code?{" "}
                            <button
                                type="button"
                                className="text-teal-600 hover:underline font-medium"
                                onClick={handleResend}
                            >
                                {sendOtpMutation.isPending ? "Resending..." : "Resend"}
                            </button>
                        </p>
                    </form>

                    <div className="my-6 text-center relative">
                        <span className="px-2 bg-white text-gray-500 text-sm relative z-10">
                            Or Login With
                        </span>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
                    </div>

                    {/* Google Login Button */}
                    {/* <Button variant="outline" className="w-full flex gap-2">
            <Image src={google} alt="google logo" className="w-5 h-5" />
            Google Account
          </Button> */}
                    <p className="text-center text-gray-500 text-xs mt-8">
                        &copy;SecureXAi Corp 2024 All Rights Reserved
                    </p>
                </div>
            </div>
        );
    }


    if (showSetPassWord) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
                <div className="absolute top-8">
                    <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
                </div>

                <div className="w-full max-w-md px-6 py-8 bg-white border rounded-lg shadow-md">
                    <h1 className="text-2xl font-semibold text-center mb-4">
                        Set Your Password
                    </h1>

                    <p className="text-gray-600 mb-6 text-sm text-center">
                        Create a new password to secure your account.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* New Password Input */}
                            <div className="py-2">
                                <Label className="block mb-2 text-gray-700 font-medium">
                                    Enter New Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Enter your password here"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500 bg-gray-100 rounded-full cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {isPasswordVisible ? <Eye /> : <EyeOff />}
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="py-2">
                                <Label className="block mb-2 text-gray-700 font-medium">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Confirm your password here"
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        required

                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <div
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-500 bg-gray-100 rounded-full cursor-pointer"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {isPasswordVisible ? <Eye /> : <EyeOff />}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-teal-900 hover:bg-teal-800 rounded-md transition-colors"
                                >
                                    Set Password
                                </Button>
                            </div>
                        </div>
                    </form>


                    <p className="text-center text-gray-500 text-xs mt-8">
                        &copy; SecureXAi Corp 2024 All Rights Reserved
                    </p>
                </div>
            </div>
        );
    }

    return (

        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-2">
            <div className="absolute top-8">
                <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
            </div>
            <div className="w-full max-w-md px-6 py-8 bg-white border border-primary-50 rounded-lg shadow-md">
                <div className="flex flex-col items-center justify-center mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold text-center">
                            Accept Invitation
                        </h1>
                    </div>
                </div>

                {!token && (
                    <p className="text-red-500 text-center mb-4">
                        No token found in the query string.
                    </p>
                )}

                <form className="space-y-4" onClick={handleVerifyClick}>
                    {/* {token && (
                        <div>
                            <p className="text-gray-600 mb-6 text-sm text-center">
                                A token has been detected. Please verify to proceed.
                            </p>
                            <Input
                                type="text"
                                value={token}
                                readOnly
                                className="bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    )} */}

                    <Button className="w-full" type="submit" >
                        Verify
                    </Button>
                </form>

                <p className="text-center mt-6 text-sm">
                    Don&apos;t have an account?{" "}
                    <a href="/auth/signup" className="text-teal-600 hover:underline">
                        Create an Account
                    </a>
                </p>
            </div>
            <p className="text-center text-gray-500 text-xs mt-8">
                &copy; SecureXAi Corp 2024 All Right Reserved
            </p>
        </div>
    );
};

export default AcceptInvitePage;

