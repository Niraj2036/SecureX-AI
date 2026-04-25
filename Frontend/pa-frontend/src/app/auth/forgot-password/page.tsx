"use client";

import google from "../../../../public/auth/google.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useSessionStore from "@/store/sessionStore";
import { useToast } from "@/hooks/use-toast";

const logo = "/logo.svg";

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

  // Send OTP Mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`${backendUrl}/otp/send`, {
        email: data.email,
        reason: "reset_pass",
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      console.log("OTP sent successfully.");
      setEmailInStore(variables.email);
      toast({
        title: "OTP Sent Succesfully",
        description: "Check your mail",
      });
      router.push("/auth/otp");
    },
    onError: (error) => {
      toast({
        title: "OTP Sent failed",
        description: "Enter Valid Email Address",
      });
      console.error("Error sending OTP:", error.message);
    },
  });

  // Form Submit Handler
  const onSubmit: SubmitHandler<FormData> = (data) => {
    sendOtpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-2">
      {/* Logo */}
      <div className="absolute top-8">
        <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md px-6 py-8 bg-white border border-primary-50 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-center">
              Forgot Your Password?
            </h1>
          </div>
        </div>

        <p className="text-gray-600 mb-6 text-sm text-center">
          Enter your registered email
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <Label className="block text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="Enter your email address here"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            type="submit"
            disabled={sendOtpMutation.isPending}
          >
            {sendOtpMutation.isPending ? "Sending..." : "Send Me The Link"}
          </Button>

          {sendOtpMutation.isError && (
            <p className="text-red-500 text-sm mt-2">
              Failed to send OTP. Please try again.
            </p>
          )}
        </form>

        {/* Divider */}
        <div className="my-6 text-center relative">
          <span className="px-2 bg-white text-gray-500 text-sm relative z-10">
            Or
          </span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
        </div>

        {/* Google Login Button */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Image src={google} alt="google logo" className="w-5 h-5" />
          <span>Continue Login</span>
        </Button>

        {/* Create Account Link */}
        <p className="text-center mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-teal-600 hover:underline">
            Create an Account
          </a>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-xs mt-8">
        &copy; SecureXAi Corp 2024 All Right Reserved
      </p>
    </div>
  );
};

export default Page;
