import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import React, { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        // ✅ rememberMe is perfectly passed to Better Auth here
        rememberMe: values.rememberMe,
      },
      {
        onSuccess: () => {
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          form.setError("root", {
            message: ctx.error.message || "Invalid email or password.",
          });
          setIsLoading(false);
        },
      }
    );
  }

  // Force the Enter key to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard", // 🚀 Changed from absolute to relative
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side Branding (Desktop/Tablet) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 xl:w-1/3 bg-primary/5 border-r border-border/50 items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] bg-primary/20 blur-[80px] lg:blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm lg:max-w-md">
          <div className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl bg-primary mb-6 lg:mb-8 shadow-lg shadow-primary/20">
            <GraduationCap className="h-8 w-8 lg:h-10 lg:w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3 lg:mb-4">
            Welcome back to Kaizen
          </h1>
          <p className="text-muted-foreground text-base lg:text-lg">
            Pick up exactly where you left off. Your next target band score is waiting for you.
          </p>
        </div>
      </div>

      {/* Right Side Form (All Screens) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 relative z-10">
          
          {/* Mobile Branding (Visible only on Mobile) */}
          <div className="flex flex-col items-center justify-center md:hidden mb-6 sm:mb-8 text-center space-y-3">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
             </div>
             <h1 className="text-xl font-bold tracking-tight text-foreground">Kaizen</h1>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Log in
            </h2>
            <p className="text-muted-foreground mt-1.5 sm:mt-2 text-sm sm:text-base">
              Enter your credentials to access your account
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={handleKeyDown}
              className="space-y-5 sm:space-y-6"
            >
              {form.formState.errors.root && (
                <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        {...field}
                        className="bg-card/50 h-11"
                        disabled={isLoading}
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="bg-card/50 pr-10 h-11"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors p-0 flex items-center justify-center focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me Checkbox */}
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <Button
                disabled={isLoading}
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 sm:h-12 text-sm sm:text-base font-medium transition-all active:scale-[0.99]"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Button
              onClick={() => handleSocialLogin("google")}
              variant="outline"
              type="button"
              className="bg-card/50 border-border hover:bg-muted/50 h-11 sm:h-12 w-full transition-all active:scale-[0.99]"
              disabled={isLoading}
            >
              <FaGoogle className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button
              onClick={() => handleSocialLogin("github")}
              variant="outline"
              type="button"
              className="bg-card/50 border-border hover:bg-muted/50 h-11 sm:h-12 w-full transition-all active:scale-[0.99]"
              disabled={isLoading}
            >
              <FaGithub className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 sm:mt-10">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}