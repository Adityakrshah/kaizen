import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { 
  GraduationCap, ArrowRight, ArrowLeft, 
  CheckCircle2, Eye, EyeOff, Loader2, Sparkles 
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  exam: z.string().min(1, "Please select an exam"),
  targetScore: z.string().min(1, "Target score is required"),
});

export function Signup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", exam: "", targetScore: "" },
  });

  const nextStep = async () => {
    const isValid = await form.trigger(["name", "email", "password"]);
    if (isValid) setStep(2);
  };

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    }, {
      onSuccess: async () => {
        // Sync Study Goals to custom Backend
        try {
          await fetch(`${import.meta.env.VITE_SERVER_URL}/api/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include", 
            body: JSON.stringify({
              examType: values.exam,
              targetScore: values.targetScore,
            }),
          });
        } catch (e) {
          console.error("Custom settings sync failed, but user was created.");
        }

        toast.success("Account created successfully!");
        window.location.href = "https://kaizen.adityakshah.com.np/dashboard";
      },
      onError: (ctx) => {
        setIsLoading(false);
        
        // 🚀 THE REDIRECT LOGIC FOR EXISTING USERS
        if (ctx.error.status === 422) {
          toast.info("Email already registered. Taking you to login...");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        } else {
          toast.error(ctx.error.message || "Signup failed");
          setStep(1); // Send back to step 1 to fix other errors
        }
      }
    });
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    authClient.signIn.social({
      provider,
      callbackURL: "/dashboard", // 🚀 Changed from absolute to relative
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Branding - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 border-r items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-xl mb-4">
            <GraduationCap className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Master your future with Kaizen.</h1>
          <p className="text-muted-foreground text-lg italic">The world's first fully-free, AI-powered IELTS & PTE platform.</p>
          <div className="space-y-4 text-left pt-6">
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> <span>Personalized Study Roadmap</span></div>
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> <span>Instant AI Speaking Analysis</span></div>
            <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-primary" /> <span>Real-time Writing Feedback</span></div>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 md:p-20 relative z-10">
        <div className="max-w-[400px] w-full mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
            <p className="text-muted-foreground text-sm">Step {step} of 2: {step === 1 ? "Personal Info" : "Study Goals"}</p>
            <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
              <div className={`h-full bg-primary transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`} />
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Name" {...field} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Email" {...field} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading}/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="button" onClick={nextStep} className="w-full h-11 font-bold group">
                    Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <FormField control={form.control} name="exam" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Exam</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ielts_academic">IELTS Academic</SelectItem>
                          <SelectItem value="ielts_general">IELTS General</SelectItem>
                          <SelectItem value="pte_academic">PTE Academic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="targetScore" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Score (Band / Points)</FormLabel>
                      <FormControl><Input placeholder="e.g. 8.0" {...field} disabled={isLoading}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 font-bold" disabled={isLoading}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-[2] h-11 font-bold" disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <><Sparkles className="mr-2 h-4 w-4" /> Finish Setup</>}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>

          {step === 1 && (
            <div className="space-y-6">
              <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-bold">Or Join With</span></div></div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-11 border-2 hover:bg-primary/5"><FaGoogle className="mr-2" /> Google</Button>
                <Button variant="outline" onClick={() => handleSocialLogin("github")} className="h-11 border-2 hover:bg-primary/5"><FaGithub className="mr-2" /> GitHub</Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-black hover:underline">Log in</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}