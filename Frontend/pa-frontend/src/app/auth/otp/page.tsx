"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import Image from "next/image";
import google from "../../../../public/auth/google.png";
import useSessionStore from "@/store/sessionStore";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const logo = "/logo.svg";

const Page = () => {
  const [value, setValue] =useState<string>("");
  const storedEmail = useSessionStore.getState().email;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
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
      console.log("OTP verification successful:", data);
      const { token } = data.data;
      setotpSession(token);
      router.push("/auth/new-password");
    },
    onError: (error: Error) => {
      console.error("OTP verification failed:", error.message);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${backendUrl}/otp/send`, {
        email: storedEmail,
        reason: "reset_pass",
      });
      console.log("Resend OTP response:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("OTP resend successful:", data);
    },
    onError: (error: Error) => {
      console.error("Resending OTP failed:", error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    verifyOtpMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast({
          title: "OTP Validation Succcessfull",
          description: "Redirecting to Change Password Page",
        });
        router.push("/auth/new-password");
        console.log("Success Response:", data);
      },
      onError: (error) => {
        toast({
          title: "OTP Validation Failed ",
          description: "Enter Valid OTP",
        });
        console.error("Error Response verifye error:", error);
      },
    });
  };

  const handleResend = () => {
    resendOtpMutation.mutate(undefined, {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {/* Logo */}
      <div className="absolute top-8">
        <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md px-6 py-8 bg-white border rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center mb-4">
          <h1 className="text-2xl font-semibold text-center">
            OTP Verification
          </h1>
        </div>

        <p className="text-gray-600 mb-6 text-sm text-center">
          Enter the OTP to verify your account.
        </p>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={resendOtpMutation.isPending}
            >
              {resendOtpMutation.isPending ? "Resending..." : "Resend"}
            </button>
          </p>
        </form>

        {/* Divider */}
        <div className="my-6 text-center relative">
          <span className="px-2 bg-white text-gray-500 text-sm relative z-10">
            Or Login With
          </span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
        </div>

        {/* Google Login Button */}
        <Button variant="outline" className="w-full flex gap-2">
          <Image src={google} alt="google logo" className="w-5 h-5" />
          Google Account
        </Button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          &copy;SecureXAi Corp 2024 All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Page;

