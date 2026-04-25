"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import lock from "../../../../public/auth/lock.png";
import useSessionStore from "@/store/sessionStore";
import { useToast } from "@/hooks/use-toast";

const logo = "/logo.svg";

const Page = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="absolute top-8">
        <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
      </div>

      <div className="w-full max-w-md px-6 py-8 bg-white border rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-center">
              Create A New Password
            </h1>
          </div>
        </div>

        <p className="text-gray-600 mb-6 text-sm text-center">
          For your security, changing your password will log you out of all
          devices.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>
              Enter New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password here"
                className="w-full"
                required
              />
              <Image
                src={lock}
                alt="lock"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <Label>
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password here"
                className="w-full"
                required
              />
              <Image
                src={lock}
                alt="lock"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 cursor-pointer"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending
              ? "Resetting Password..."
              : "Create New Password"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-teal-600 hover:underline">
            Create an Account
          </Link>
        </p>

        <p className="text-center text-gray-500 text-xs mt-8">
          &copy;SecureXAi Corp 2024 All Right Reserved
        </p>
      </div>
    </div>
  );
};

export default Page;

