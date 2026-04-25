"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { BASE_URL } from "@/constant";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import axios from "axios";
import google from "../../../../public/auth/google.png";
import hand from "../../../../public/auth/hand.png";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useSessionStore from "@/store/sessionStore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const logo = "/logo.svg";

// import microsoft from "../../../../public/auth/microsoft.png";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const Page = () => {
  const form = useForm({
    mode: "onBlur",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const { toast } = useToast();
  const { setEmail } = useSessionStore();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ email, password }: z.infer<typeof loginSchema>) => {
      const res = await axios.post(`${BASE_URL}/users/login`, {
        email: email.toLowerCase(),
        password: password,
      });

      return res.data;
    },

    onSuccess: (data) => {
      console.log("data", data);
      signIn("credentials", {
        token: data.data.access_token,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    },
    onError: (error: {
      status?: number;
      response?: { data?: { message?: string } };
    }) => {
      // if (error.status === 403) {
      //   setEmail(form.getValues("email"));
      //   router.push("/auth/verify-otp");
      // }
      toast({
        title: "Login Failed",
        description: error?.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-3">
        <div className="absolute top-6 ">
          <Image src={logo} alt="logo" width={120} height={32} className="h-8 w-auto " />
        </div>

        <div className="w-full max-w-md px-6 mt-10 py-8 bg-white border rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-center">
                Welcome Back
              </h1>
              <Image src={hand} alt="hand" className="w-6 h-6" />
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Enter your email and your password to access your account.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((e) => mutate(e))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {" "}
                      Email Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address here"
                        className="w-full shadow-sm"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="Enter your password here"
                          className="w-full shadow-sm"
                          required
                          {...field}
                        />
                        <div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 rounded-full text-gray-700 flex h-6 justify-center bg-secondary-100 p-1 items-center cursor-pointer"
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? <Eye /> : <EyeOff />}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Input type="checkbox" className="w-4 h-4" />
                  <Label className="text-xs">Remember Me</Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-teal-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full shadow-sm"
                isLoading={isPending}
              >
                Login
              </Button>
            </form>
          </Form>

          <div className="my-6 text-center relative">
            <span className="px-2 bg-white text-gray-500 text-sm relative z-10">
              Or Login With
            </span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0"></div>
          </div>

          <Button
            variant="outline"
            className="w-full flex gap-2 my-2 shadow-sm"
            onClick={() => signIn("google")}
          >
            <Image src={google} alt="google logo" className="w-5 h-5" />
            Google Account
          </Button>
          {/*  <Button
            variant="outline"
            className="w-full flex gap-2 shadow-sm"
            onClick={() => signIn("microsoft-entra-id")}
          >
            <Image src={microsoft} alt="google logo" className="w-5 h-5" />
            Microsoft Account
          </Button> */}

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
    </>
  );
};

export default Page;

