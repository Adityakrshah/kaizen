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
    await authClient.signIn.email({
        email: values.email,
        password: values.password,
        // ✅ rememberMe is perfectly passed to Better Auth here
        rememberMe: values.rememberMe, 
    }, {
        onSuccess: () => { window.location.href = "/dashboard"; },
        onError: (ctx) => {
            form.setError("root", { message: ctx.error.message || "Invalid email or password." });
            setIsLoading(false);
        }
    });
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
      {/* Left Side Branding */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 border-r border-border/50 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-8 shadow-lg shadow-primary/20">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Welcome back to Kaizen</h1>
          <p className="text-muted-foreground text-lg">Pick up exactly where you left off. Your next target band score is waiting for you.</p>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Log in</h2>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6">
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
                      <Input placeholder="name@example.com" {...field} className="bg-card/50" disabled={isLoading} />
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
                      <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80">Forgot password?</Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-card/50 pr-10" 
                            disabled={isLoading} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                    <FormLabel className="text-sm font-medium leading-none cursor-pointer">Remember me</FormLabel>
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleSocialLogin("google")} variant="outline" type="button" className="bg-card/50 border-border hover:bg-muted/50 h-11" disabled={isLoading}>
              <FaGoogle className="mr-2 h-4 w-4" /> Google
            </Button>
            <Button onClick={() => handleSocialLogin("github")} variant="outline" type="button" className="bg-card/50 border-border hover:bg-muted/50 h-11" disabled={isLoading}>
              <FaGithub className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account? <Link to="/signup" className="font-semibold text-primary hover:text-primary/80">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}