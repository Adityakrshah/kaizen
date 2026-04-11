import { useNavigate } from "react-router-dom";
import { Edit3, MapPin, Calendar, BookOpen, Target, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useSession } from "@/lib/auth-client";
import { useProfile } from "@/features/settings/hooks/useProfile";
import { useProgress } from "@/features/dashboard/hooks/useProgress";

export function Profile() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = useSession();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: progressData } = useProgress();

  if (sessionPending || profileLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  const user = session?.user;
  const stats = progressData?.data?.stats;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. COVER PHOTO & AVATAR SECTION */}
        <div className="relative mb-20">
          <div className="h-48 md:h-64 w-full bg-muted rounded-3xl border border-border/50 overflow-hidden relative">
             {profile?.coverPicture ? (
               <img src={profile.coverPicture} alt="Cover" className="w-full h-full object-cover" />
             ) : (
               // Fallback gradient if they haven't uploaded one
               <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-background">
                 <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
               </div>
             )}
          </div>
        
       <div className="absolute -bottom-16 left-8 md:left-12 flex items-end gap-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-2xl bg-muted">
            {/* 🚀 Check profile.profilePicture first! */}
            <AvatarImage src={profile?.profilePicture || user?.image || ""} className="object-cover" />
            <AvatarFallback className="text-4xl font-black">{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="absolute -bottom-12 right-8 flex gap-3">
          <Button onClick={() => navigate("/settings")} className="shadow-lg rounded-full font-bold px-6">
            <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* 2. BIO & DETAILS */}
      <div className="px-4 md:px-12 space-y-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">{user?.name || "Student"}</h1>
          <p className="text-muted-foreground font-medium text-lg mt-1">{user?.email}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
          {profile?.country && (
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
              <MapPin className="h-4 w-4" /> {profile.country}
            </div>
          )}
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border">
            <Calendar className="h-4 w-4" /> Joined {new Date(user?.createdAt || Date.now()).getFullYear()}
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-2xl leading-relaxed text-foreground/90">
          {profile?.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <p className="italic text-muted-foreground">No bio added yet. Click "Edit Profile" to tell us about your IELTS journey.</p>
          )}
        </div>

        {/* 3. STUDY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 mt-8 border-t border-border/50">
          <Card className="bg-card shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl"><Target className="h-8 w-8" /></div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target Score</p>
                <p className="text-3xl font-black">{stats?.targetScore || "7.0"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Award className="h-8 w-8" /></div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Band</p>
                <p className="text-3xl font-black">{stats?.currentScore || "0.0"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl"><BookOpen className="h-8 w-8" /></div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Day Streak</p>
                <p className="text-3xl font-black">{stats?.streakDays || "0"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}