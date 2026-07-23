import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, GraduationCap, Save, ShieldAlert, 
  Eye, Loader2, Minus, Plus, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; 
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSession, authClient } from "@/lib/auth-client";
import { useProfile } from "@/features/settings/hooks/useProfile";

export function Settings() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();
  const { profile, updateProfile, deleteProfile } = useProfile(); 
  
  // Navigation State
  const [activeSection, setActiveSection] = useState<"account" | "study">("account");

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile States
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [isViewingImage, setIsViewingImage] = useState(false);

  // Study Settings States
  const [examType, setExamType] = useState("ielts_academic");
  const [targetScore, setTargetScore] = useState("7.5");
  const [dailyGoal, setDailyGoal] = useState(60);

  // 1. 🔄 INITIAL DATA FETCH & STATE SYNC
  useEffect(() => {
    async function syncData() {
      if (!session?.user) return;
      if (profile?.coverPicture) setCoverPreview(profile.coverPicture);
      try {
        // Sync Identity
        setName(session.user.name || "");
        setAvatarPreview(session.user.image || null);

        // Sync Profile Details
        if (profile) {
           setBio(profile.bio || "");
           setCountry(profile.country || "");
           if (profile.profilePicture) setAvatarPreview(profile.profilePicture);
        }

        // Sync Study Preferences
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/settings`, { 
          credentials: "include" 
        });
        const result = await res.json();
        
        if (result.success && result.data) {
          setExamType(result.data.examType || "ielts_academic");
          setTargetScore(result.data.targetScore || "7.5");
          setDailyGoal(Number(result.data.dailyStudyGoal) || 60);
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

  // 3. 🚀 SAVE EVERYTHING
  const handleSave = async () => {
    setIsSaving(true);
    
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        // Step A: Update Better Auth
        await authClient.updateUser({ name });

        // Step B: Update Custom Profile DB
        await updateProfile.mutateAsync({ 
          bio, 
          country, 
          profilePicture: avatarPreview, 
          coverPicture: coverPreview 
        });

        // Step C: Update Study Profile
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
          body: JSON.stringify({
            examType,
            targetScore,
            dailyStudyGoal: dailyGoal.toString(),
          }),
        });

        if (response.ok) resolve(true);
        else throw new Error("Backend update failed");
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
      await deleteProfile.mutateAsync(); 
      await authClient.signOut(); 
      toast.success("Account disabled. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error("Failed to disable account.");
      setIsDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Premium Image Viewer */}
      {isViewingImage && avatarPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 cursor-pointer" onClick={() => setIsViewingImage(false)}>
          <img src={avatarPreview} alt="Full view" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10" />
          <p className="absolute bottom-10 text-white/50 text-sm font-medium">Tap anywhere to close</p>
        </div>
      )}

      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Manage your account and study preferences.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Button variant="outline" onClick={() => navigate("/profile")} className="w-full sm:w-auto h-11 font-semibold">
            View Public Profile
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto h-11 font-semibold bg-primary text-primary-foreground shadow-md active:scale-[0.98] transition-all">
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Responsive Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <Select value={activeSection} onValueChange={(val: any) => setActiveSection(val)}>
              <SelectTrigger className="h-12 bg-background font-semibold text-base shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account"><div className="flex items-center gap-2"><User size={16} /> Profile Information</div></SelectItem>
                <SelectItem value="study"><div className="flex items-center gap-2"><GraduationCap size={16} /> Study Goals</div></SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Sidebar Menu */}
          <div className="hidden md:flex flex-col gap-1">
            <button 
              onClick={() => setActiveSection("account")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "account" ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              <User size={18} /> Profile Information
            </button>
            <button 
              onClick={() => setActiveSection("study")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeSection === "study" ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
              <GraduationCap size={18} /> Study Goals
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          
          {/* SECTION: ACCOUNT */}
          {activeSection === "account" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4 border-b border-border/30">
                  <CardTitle className="text-xl">Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">

                  {/* Cover Photo */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cover Photo</Label>
                    <div className="group h-32 md:h-48 w-full bg-muted rounded-xl border-2 border-dashed border-border/50 relative overflow-hidden transition-all hover:border-primary/50 cursor-pointer">
                      {coverPreview ? (
                        <img src={coverPreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <Camera className="h-8 w-8 mb-2 opacity-50" />
                          <span className="text-sm font-medium">Tap to upload cover</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <p className="text-white font-semibold flex items-center gap-2 text-sm"><Camera className="h-4 w-4"/> Change</p>
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
                    {coverPreview && <Button variant="ghost" size="sm" className="text-destructive h-auto py-1 px-2" onClick={() => setCoverPreview(null)}>Remove Cover</Button>}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pt-4">
                    <div className="relative group cursor-pointer shrink-0 rounded-full" onClick={() => setIsViewingImage(true)}>
                      <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105">
                        <AvatarImage src={avatarPreview || ""} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                          {name.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Eye className="text-white h-6 w-6 mb-1" />
                        <span className="text-white text-[10px] font-bold tracking-widest uppercase">View</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">Avatar</Label>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                        <div className="relative">
                          <Button variant="secondary" size="sm" className="shadow-sm">Upload Photo</Button>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                        </div>
                        {avatarPreview && (
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={removeAvatar}>Remove</Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Preferred size: 400x400px. JPG or PNG under 2MB.</p>
                    </div>
                  </div>
                  
                  {/* Text Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Full Name</Label>
                      <Input value={name} onChange={e => setName(e.target.value)} className="h-11 bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Country</Label>
                      <Input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. India" className="h-11 bg-background/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Bio</Label>
                    <Textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)} 
                      placeholder="Tell us a little about your IELTS goals..." 
                      className="bg-background/50 resize-none h-24 text-base" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/30 bg-destructive/5 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-destructive flex items-center gap-2 text-lg"><ShieldAlert className="h-5 w-5" /> Danger Zone</CardTitle>
                  <CardDescription className="text-destructive/80">Permanently disable your account and hide your data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="w-full sm:w-auto shadow-sm">
                    {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
                    Disable Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION: STUDY PROFILE */}
          {activeSection === "study" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4 border-b border-border/30">
                  <CardTitle className="text-xl">Target Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-semibold">Target Exam</Label>
                      <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ielts_academic">IELTS Academic</SelectItem>
                          <SelectItem value="ielts_general">IELTS General</SelectItem>
                          <SelectItem value="pte_academic">PTE Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Target Score</Label>
                      <Select value={targetScore} onValueChange={setTargetScore}>
                        <SelectTrigger className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["6.5", "7.0", "7.5", "8.0", "8.5", "9.0"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/30">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <Label className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Daily Study Goal</Label>
                      <span className="text-2xl font-black text-primary">{dailyGoal} mins</span>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-xl border border-border/40 max-w-sm mx-auto sm:mx-0">
                      <Button variant="secondary" size="icon" className="h-10 w-10 shrink-0" onClick={() => setDailyGoal(Math.max(15, dailyGoal - 15))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center font-medium text-sm">Study Pace</div>
                      <Button variant="secondary" size="icon" className="h-10 w-10 shrink-0" onClick={() => setDailyGoal(Math.min(480, dailyGoal + 15))}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}