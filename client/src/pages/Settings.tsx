import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Bell, GraduationCap, Save, ShieldAlert, Camera, 
  Trash2, Eye, Loader2, Minus, Plus, ChevronDown 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // Recommended for success/error feedback
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSession, authClient } from "@/lib/auth-client";

export function Settings() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // States for the form
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isViewingImage, setIsViewingImage] = useState(false);

  // States for the Study Profile & Notifications (Backend brain logic)
  const [examType, setExamType] = useState("ielts_academic");
  const [targetScore, setTargetScore] = useState("7.5");
  const [dailyGoal, setDailyGoal] = useState(60);
  const [reminders, setReminders] = useState(true);

  // 1. 🔄 INITIAL DATA FETCH & STATE SYNC
  useEffect(() => {
    async function syncData() {
      if (!session?.user) return;
      
      try {
        // Sync Identity (Better Auth)
        setName(session.user.name || "");
        setAvatarPreview(session.user.image || null);

        // Sync Preferences (Custom Kaizen Backend)
        const res = await fetch("http://localhost:5000/api/settings", { 
          credentials: "include" 
        });
        const result = await res.json();
        
        if (result.success && result.data) {
          setExamType(result.data.examType || "ielts_academic");
          setTargetScore(result.data.targetScore || "7.5");
          setDailyGoal(Number(result.data.dailyStudyGoal) || 60);
          setReminders(result.data.notifications?.dailyReminders ?? true);
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
      } finally {
        setInitialLoading(false);
      }
    }

    if (!sessionPending) syncData();
  }, [session, sessionPending]);

  // 2. 📸 HANDLE IMAGE (Avatar) PREVIEW
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("File size must be under 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => setAvatarPreview(null);

  // 3. 🚀 THE BIG FIX: SAVE EVERYTHING & RELOAD
  const handleSave = async () => {
    setIsSaving(true);
    
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        // Step A: Update Better Auth (Profile Info)
        await authClient.updateUser({
          name: name,
          image: avatarPreview || "",
        });

        // Step B: Update Custom Backend (Study Profile)
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🚀 Required to pass requireAuth middleware
          body: JSON.stringify({
            examType,
            targetScore,
            dailyStudyGoal: dailyGoal.toString(),
            notifications: { dailyReminders: reminders }
          }),
        });

        if (response.ok) {
          // Success! Resolve the promise
          resolve(true);
        } else {
          throw new Error("Backend update failed");
        }
      } catch (error) {
        reject(error);
      }
    });

    // Optional: Use toast.promise for nice loading feedback
    toast.promise(savePromise, {
      loading: 'Saving changes...',
      success: () => {
        // 🚀 THE MAGIC FIX: Show a success toast, wait a second, and reload the entire page.
        // This is the only guaranteed way to make the header/tabs re-fetch fresh session data.
        setTimeout(() => window.location.reload(), 1200);
        return 'Profile saved! Sycing...';
      },
      error: 'Failed to save all changes. Check your connection.',
    });

    setIsSaving(false);
  };

  // 4. 🗑️ DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    if (!window.confirm("CRITICAL: Are you absolutely sure? This will delete all your mock test scores forever.")) return;
    setIsDeleting(true);
    try {
      await authClient.deleteUser();
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => navigate("/signup"), 1500);
    } catch (error) {
      toast.error("Security check failed. Try logging out and back in first.");
      setIsDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-muted-foreground animate-pulse">Synchronizing profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500 pb-16">
      
      {/* Premium Image Viewer */}
      {isViewingImage && avatarPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 cursor-pointer" onClick={() => setIsViewingImage(false)}>
          <img src={avatarPreview} alt="Full view" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10" />
          <p className="absolute bottom-10 text-white/50 text-sm">Tap anywhere to close</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-lg italic mt-1">Refine your Kaizen experience.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg h-12 px-10 rounded-full font-bold active:scale-95 transition-all">
          {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="account" className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        
        {/* Navigation Sidebar (Vertical on Desktop, Horizontal on Mobile) */}
        <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-1 lg:gap-2 justify-start border-b lg:border-b-0 pb-4 lg:pb-0 lg:border-l lg:pl-4 overflow-x-auto no-scrollbar">
          <TabsTrigger value="account" className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 text-sm font-semibold">
            <User size={18} /> Account
          </TabsTrigger>
          <TabsTrigger value="study" className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 text-sm font-semibold">
            <GraduationCap size={18} /> Study Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 text-sm font-semibold">
            <Bell size={18} /> Notifications
          </TabsTrigger>
        </TabsList>

        <div className="space-y-8 min-w-0">
          
          {/* TAB: ACCOUNT */}
          <TabsContent value="account" className="m-0 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-xl shadow-black/5">
              <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
              <CardContent className="space-y-10">
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <div className="relative group cursor-pointer" onClick={() => setIsViewingImage(true)}>
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                      <AvatarImage src={avatarPreview || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                        {name.charAt(0) || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="text-white h-7 w-7" />
                    </div>
                  </div>
                  <div className="space-y-3 text-center sm:text-left">
                    <Label className="text-base">Profile Image</Label>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Button variant="secondary" size="sm" className="relative">
                        Upload New Photo
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                      </Button>
                      {avatarPreview && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={removeAvatar}>Remove</Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground italic">Preferred size: 400x400px. JPG or PNG.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2.5">
                    <Label>Full Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} className="h-12 bg-background/50" />
                  </div>
                  <div className="space-y-2.5">
                    <Label>Email (Managed)</Label>
                    <Input value={session?.user.email} disabled className="h-12 bg-muted/30 border-dashed" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><ShieldAlert /> Danger Zone</CardTitle>
                <CardDescription>Permanently delete your account and all data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: STUDY PROFILE */}
          <TabsContent value="study" className="m-0 animate-in slide-in-from-right-4 duration-500">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm">
              <CardHeader><CardTitle>Target Goals</CardTitle></CardHeader>
              <CardContent className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label>Target Exam</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger className="h-12 bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ielts_academic">IELTS Academic</SelectItem>
                        <SelectItem value="ielts_general">IELTS General</SelectItem>
                        <SelectItem value="pte_academic">PTE Academic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Target Score</Label>
                    <Select value={targetScore} onValueChange={setTargetScore}>
                      <SelectTrigger className="h-12 bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["6.5", "7.0", "7.5", "8.0", "8.5", "9.0"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><Label className="text-muted-foreground uppercase text-xs font-black">Daily Study Goal</Label><span className="text-2xl font-black text-primary">{dailyGoal} mins</span></div>
                  <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl border border-border/40">
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setDailyGoal(Math.max(15, dailyGoal - 15))}><Minus /></Button>
                    <div className="flex-1 text-center font-medium">Study Pace</div>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" onClick={() => setDailyGoal(Math.min(480, dailyGoal + 15))}><Plus /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* TAB: NOTIFICATIONS */}
          <TabsContent value="notifications" className="m-0 animate-in slide-in-from-right-4 duration-500">
             <Card>
                <CardHeader><CardTitle>Email Alerts</CardTitle></CardHeader>
                <CardContent className="space-y-6 p-6">
                    <div className="flex items-center justify-between gap-6 p-4 rounded-2xl border bg-background/40">
                        <div className="space-y-1"><p className="font-bold">Daily Motivation</p><p className="text-xs text-muted-foreground">Receive an email reminder when you haven't hit your goal.</p></div>
                        <Switch checked={reminders} onCheckedChange={setReminders} />
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}