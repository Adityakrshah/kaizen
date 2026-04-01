import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Target, 
  Flame, 
  BookOpen, 
  ArrowRight, 
  BrainCircuit, 
  Sparkles, 
  Loader2,
  ExternalLink 
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";

export function Dashboard() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("http://localhost:5000/api/progress/dashboard", { 
          credentials: "include" 
        });
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally { 
        setIsLoading(false); 
      }
    }

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (isLoading || !data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  const { stats, moduleAverages, recentTests, insights } = data;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 pb-20">
      
      {/* 1. HEADER */}
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {session?.user.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground italic">Your IELTS prep dashboard.</p>
        </div>
        <Link to="/mocktest">
          <Button className="rounded-full px-6 shadow-lg shadow-primary/20">
            New Mock Test
          </Button>
        </Link>
      </div>

      {/* 2. CORE STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatItem 
          icon={<Target className="text-primary"/>} 
          label="Est. Band" 
          value={stats.currentScore > 0 ? stats.currentScore.toFixed(1) : "N/A"} 
        />
        <StatItem 
          icon={<BookOpen className="text-purple-500"/>} 
          label="Vocabulary" 
          value={`${stats.vocabLearned || 0} Words`} 
        />
        <StatItem 
          icon={<Flame className="text-orange-500"/>} 
          label="Streak" 
          value={`${stats.streakDays || 0} Days`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. SKILL PROFICIENCY */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary"/> Skill Proficiency
          </h3>
          <div className="grid gap-4">
            {Object.entries(moduleAverages).map(([key, score]: any) => (
              <div key={key} className="group p-4 bg-card border rounded-xl flex items-center justify-between hover:border-primary/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="capitalize font-medium w-24">{key}</div>
                  <div className="hidden sm:block w-48">
                    <Progress value={((score as number) / 9) * 100} className="h-1.5" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="font-bold text-xl">
                      {score > 0 ? score.toFixed(1) : (
                        <Link to={`/${key.toLowerCase()}`} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                          Practice Now <ExternalLink className="h-3 w-3"/>
                        </Link>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. AI RECOMMENDATION */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">AI Recommendation</h3>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                <BrainCircuit className="h-5 w-5" /> Next Step
              </div>
              <div>
                <p className="font-bold text-lg">Focus on {insights?.weakest?.module || "General Practice"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {insights?.weakest?.tip || "Complete more tests to get personalized insights."}
                </p>
              </div>
              <Button className="w-full bg-background border mt-2 group" variant="outline" asChild>
                <Link to={`/${insights?.weakest?.module?.toLowerCase() || 'dashboard'}`}>
                   Start Learning <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. RECENT SUBMISSIONS */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Recent Submissions</h3>
        {recentTests && recentTests.length > 0 ? (
          <div className="border rounded-xl overflow-hidden bg-card">
            {recentTests.map((test: any) => (
              <div key={test.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${test.score > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {test.score ? test.score.toFixed(1) : "0.0"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{test.name}</p>
                    <p className="text-xs text-muted-foreground">{test.date}</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/mocktest/result/${test.id}`} className="font-bold text-primary hover:text-primary/80">
                    View Result
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
             <p className="text-muted-foreground font-medium">No test history found yet.</p>
             <Link to="/mocktest">
                <Button variant="link" className="mt-2">Take your first test</Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 bg-card border rounded-2xl flex items-center gap-4 transition-all hover:shadow-md">
      <div className="p-3 bg-muted rounded-xl">{icon}</div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}