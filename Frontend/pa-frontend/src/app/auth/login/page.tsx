"use client";

import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900/95 p-4">
      <div className="w-full max-w-md v3-card p-8 bg-card/90 border border-border/80 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-indigo-500/30 text-indigo-400">
            <Sparkles className="h-3 w-3 mr-1 text-indigo-400" /> SecureX AI V3
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight v3-gradient-text">
            Welcome Back
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to access your organization dashboard and workspace.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((e) => mutate(e))} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        className="pl-9 text-xs border-border/80"
                        required
                        {...field}
                      />
                    </div>
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold">Password</FormLabel>
                    <Link href="/auth/forgot-password" className="text-xs text-indigo-500 hover:underline font-medium">
                      Forgot?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9 text-xs border-border/80"
                        required
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={togglePasswordVisibility}
                      >
                        {isPasswordVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full font-semibold text-xs h-10 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full text-xs font-semibold h-10 border-border/80"
          onClick={() => signIn("google")}
        >
          Google Account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-indigo-500 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;