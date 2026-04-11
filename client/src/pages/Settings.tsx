import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Bell, GraduationCap, Save, ShieldAlert, 
  Eye, Loader2, Minus, Plus , Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"; // Make sure you have this Shadcn component!
import { toast } from "sonner"; 
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSession, authClient } from "@/lib/auth-client";
import { useProfile } from "@/features/settings/hooks/useProfile"; // 🚀 Added our hook!

export function Settings() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();
  const { profile, updateProfile, deleteProfile } = useProfile(); // 🚀 Pulling in backend DB
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // States for the form
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
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
      if (profile?.coverPicture) setCoverPreview(profile.coverPicture);
      try {
        // Sync Identity (Better Auth)
        setName(session.user.name || "");
        setAvatarPreview(session.user.image || null);

       // Sync Profile Details (Our MongoDB Profile)
        if (profile) {
           setBio(profile.bio || "");
           setCountry(profile.country || "");
           // 🚀 Pull the image from our DB, fallback to Better Auth if empty
           if (profile.profilePicture) {
             setAvatarPreview(profile.profilePicture);
           }
        }

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
  }, [session, sessionPending, profile]);

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
        // Step A: Update Better Auth (Profile Info - we can skip sending the huge image here)
        await authClient.updateUser({ name: name });

        // Step B: Update our Custom Profile DB (Send the image here!)
        await updateProfile.mutateAsync({ bio, country, profilePicture: avatarPreview, coverPicture: coverPreview });
        await updateProfile.mutateAsync({ 
          bio, 
          country, 
          profilePicture: avatarPreview // 🚀 ADD THIS LINE
        });

        // Step C: Update Custom Backend (Study Profile)
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
          body: JSON.stringify({
            examType,
            targetScore,
            dailyStudyGoal: dailyGoal.toString(),
            notifications: { dailyReminders: reminders }
          }),
        });

        if (response.ok) {
          resolve(true);
        } else {
          throw new Error("Backend update failed");
        }
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(savePromise, {
      loading: 'Saving changes...',
      success: () => {
        setTimeout(() => window.location.reload(), 1200);
        return 'Profile saved! Syncing...';
      },
      error: 'Failed to save all changes. Check your connection.',
    });

    setIsSaving(false);
  };

  // 4. 🗑️ DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    if (!window.confirm("CRITICAL: Are you absolutely sure? This will disable your account.")) return;
    setIsDeleting(true);
    try {
      await deleteProfile.mutateAsync(); // Trigger the Soft Delete
      await authClient.signOut(); // Log them out
      toast.success("Account disabled. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error("Failed to disable account.");
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
      <div className="space-y-3 text-left mb-6">
  <Label className="text-base">Cover Photo</Label>
  <div className="h-32 w-full bg-muted rounded-xl border-2 border-dashed flex items-center justify-center relative overflow-hidden">
    {coverPreview ? (
      <img src={coverPreview} className="w-full h-full object-cover" />
    ) : (
      <span className="text-muted-foreground text-sm">No cover photo</span>
    )}
    <input 
      type="file" 
      className="absolute inset-0 opacity-0 cursor-pointer" 
      accept="image/*" 
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setCoverPreview(reader.result as string);
          reader.readAsDataURL(file);
        }
      }} 
    />
  </div>
  {coverPreview && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCoverPreview(null)}>Remove Cover</Button>}
</div>
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
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/profile")} className="shadow-sm h-12 px-6 rounded-full font-bold">
            View Public Profile
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="shadow-lg h-12 px-10 rounded-full font-bold active:scale-95 transition-all">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="account" className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        
        {/* Navigation Sidebar */}
        <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-1 lg:gap-2 justify-start border-b lg:border-b-0 pb-4 lg:pb-0 lg:border-l lg:pl-4 overflow-x-auto no-scrollbar">
          <TabsTrigger value="account" className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 text-sm font-semibold">
            <User size={18} /> Edit Profile
          </TabsTrigger>
          <TabsTrigger value="study" className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 text-sm font-semibold">
            <GraduationCap size={18} /> Study Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-4 py-3 rounded-xl data-[state=active]:bg-primary/5 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 text-sm font-semibold">
            <Bell size={18} /> Notifications
          </TabsTrigger>
        </TabsList>

        <div className="space-y-8 min-w-0">
          
          {/* TAB: ACCOUNT */}
          <TabsContent value="account" className="m-0 space-y-8 animate-in slide-in-from-right-4 duration-500">
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-xl shadow-black/5">
              <CardHeader><CardTitle>Public Profile Details</CardTitle></CardHeader>
              <CardContent className="space-y-10">

                {/* 🚀 COVER PHOTO WITH HOVER UPLOAD */}
                <div className="space-y-3 text-left mb-6">
                  <Label className="text-base">Cover Photo</Label>
                  <div className="group h-40 w-full bg-muted rounded-2xl border-2 border-dashed border-border/50 relative overflow-hidden transition-all hover:border-primary/50 cursor-pointer">
                    {coverPreview ? (
                      <img src={coverPreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Camera className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">Click to upload cover</span>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white font-bold flex items-center gap-2"><Camera className="h-5 w-5"/> Change Cover</p>
                    </div>

                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setCoverPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                  {coverPreview && <Button variant="ghost" size="sm" className="text-destructive mt-2" onClick={() => setCoverPreview(null)}>Remove Cover</Button>}
                </div>

                {/* 🚀 PROFILE PICTURE WITH EYE HOVER */}
                <div className="flex flex-col sm:flex-row items-center gap-10 border-t border-border/50 pt-8">
                  {/* The Hover Container */}
                  <div className="relative group cursor-pointer rounded-full" onClick={() => setIsViewingImage(true)}>
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={avatarPreview || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary text-4xl font-black">
                        {name.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* The Dark Overlay with Eye Icon */}
                    <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="text-white h-8 w-8 mb-1" />
                      <span className="text-white text-[10px] font-bold tracking-widest uppercase">View</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-center sm:text-left">
                    <Label className="text-base">Profile Avatar</Label>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Button variant="secondary" size="sm" className="relative shadow-sm">
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
                    <Label>Country</Label>
                    <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. India" className="h-12 bg-background/50" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label>Bio</Label>
                  <Textarea 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    placeholder="Tell us a little about your IELTS goals..." 
                    className="bg-background/50 resize-none h-24" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><ShieldAlert /> Danger Zone</CardTitle>
                <CardDescription>Permanently delete your account and all data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>Disable Account</Button>
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