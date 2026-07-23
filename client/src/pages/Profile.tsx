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
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        <p className="text-sm sm:text-base text-muted-foreground animate-pulse font-medium">Loading profile...</p>
      </div>
    );
  }

  const user = session?.user;
  const stats = progressData?.data?.stats;

  // Cache buster trick to force the browser to reload the image instantly after an update
  const cacheBuster = profile?.updatedAt ? new Date(profile.updatedAt).getTime() : Date.now();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. COVER PHOTO & AVATAR SECTION */}
      <div className="relative mb-16 sm:mb-20">
        <div className="h-40 sm:h-48 md:h-64 w-full bg-muted rounded-2xl sm:rounded-3xl border border-border/50 overflow-hidden relative">
           {profile?.coverPicture ? (
             <img 
               src={`${profile.coverPicture}?v=${cacheBuster}`} 
               alt="Cover" 
               className="w-full h-full object-cover" 
             />
           ) : (
             // Fallback gradient if they haven't uploaded one
             <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-background">
               <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
             </div>
           )}
        </div>
        
        {/* Avatar positioned dynamically for mobile and desktop */}
        <div className="absolute -bottom-10 sm:-bottom-16 left-4 sm:left-8 md:left-12 flex items-end gap-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl sm:shadow-2xl bg-muted">
            <AvatarImage 
              src={profile?.profilePicture ? `${profile.profilePicture}?v=${cacheBuster}` : user?.image || ""} 
              className="object-cover" 
            />
            <AvatarFallback className="text-3xl sm:text-4xl font-black">{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="absolute -bottom-12 sm:-bottom-12 right-2 sm:right-8 flex gap-2 sm:gap-3">
          <Button 
            onClick={() => navigate("/settings")} 
            size="sm" 
            className="shadow-lg rounded-full font-bold px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm"
          >
            <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 mr-1.5" /> 
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>

      {/* 2. BIO & DETAILS */}
      <div className="px-2 sm:px-8 md:px-12 space-y-5 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none break-words">
            {user?.name || "Student"}
          </h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-lg mt-1.5 sm:mt-2 break-all sm:break-normal">
            {user?.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-muted-foreground">
          {profile?.country && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate max-w-[120px] sm:max-w-none">{profile.country}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border shrink-0">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Joined {new Date(user?.createdAt || Date.now()).getFullYear()}
          </div>
        </div>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-2xl leading-relaxed text-foreground/90 break-words">
          {profile?.bio ? (
            <p>{profile.bio}</p>
          ) : (
            <p className="italic text-muted-foreground text-sm sm:text-base">No bio added yet. Click "Edit Profile" to tell us about your IELTS journey.</p>
          )}
        </div>

        {/* 3. STUDY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border/50">
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-primary/10 text-primary rounded-xl sm:rounded-2xl shrink-0"><Target className="h-6 w-6 sm:h-8 sm:w-8" /></div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Target Score</p>
                <p className="text-2xl sm:text-3xl font-black">{stats?.targetScore || "7.0"}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-emerald-500/10 text-emerald-500 rounded-xl sm:rounded-2xl shrink-0"><Award className="h-6 w-6 sm:h-8 sm:w-8" /></div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Band</p>
                <p className="text-2xl sm:text-3xl font-black">{stats?.currentScore || "0.0"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-blue-500/10 text-blue-500 rounded-xl sm:rounded-2xl shrink-0"><BookOpen className="h-6 w-6 sm:h-8 sm:w-8" /></div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider">Day Streak</p>
                <p className="text-2xl sm:text-3xl font-black">{stats?.streakDays || "0"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}