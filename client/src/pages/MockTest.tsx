import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, ArrowLeft, Award, BookOpen, Headphones, 
  PenTool, Mic, CheckCircle2, XCircle, BrainCircuit, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function MockTestResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTest() {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/mocktest/${id}`, { credentials: "include" });
        const result = await res.json();
        if (result.success) setTest(result.data);
      } catch (err) {
        console.error("Failed to fetch test details");
      } finally { setLoading(false); }
    }
    fetchTest();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
        <p className="text-sm sm:text-base text-muted-foreground animate-pulse font-medium">Loading Results...</p>
      </div>
    );
  }
  
  if (!test) {
    return (
      <div className="p-8 sm:p-12 text-center flex flex-col items-center">
        <XCircle className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-lg font-bold">Test not found</h2>
        <Button onClick={() => navigate("/dashboard")} variant="outline" className="mt-4">Return to Dashboard</Button>
      </div>
    );
  }

  const sections = [
    { name: "Reading", score: test.sections?.reading?.score || 0, icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500"/>, color: "bg-blue-500/10" },
    { name: "Listening", score: test.sections?.listening?.score || 0, icon: <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500"/>, color: "bg-purple-500/10" },
    { name: "Writing", score: test.sections?.writing?.score || 0, icon: <PenTool className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500"/>, color: "bg-orange-500/10" },
    { name: "Speaking", score: test.sections?.speaking?.score || 0, icon: <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500"/>, color: "bg-emerald-500/10" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="group pl-0 hover:bg-transparent hover:underline h-auto py-1">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform shrink-0" /> 
          <span className="hidden sm:inline">Back to </span>Dashboard
        </Button>
        <Badge variant="outline" className="font-mono uppercase tracking-widest text-[9px] sm:text-[10px] py-1 px-2 shrink-0">
          TEST_ID: {id?.substring(0, 8)}...
        </Badge>
      </div>

      {/* 2. OVERALL SCORE BANNER */}
      <div className="bg-card border rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shadow-sm text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 sm:ring-8 ring-primary/5 shrink-0">
            <Award className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Band {test.overallBand || 0}</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] sm:text-xs mt-1 sm:mt-2">Overall Band Score</p>
          </div>
        </div>
        <div className="w-full md:w-auto border-t md:border-t-0 border-border/50 pt-4 md:pt-0 mt-2 md:mt-0 md:text-right flex flex-col items-center md:items-end">
          <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Completed On</p>
          <p className="text-base sm:text-lg font-bold">{new Date(test.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto gap-1 sm:gap-2 bg-muted/50 p-1 mb-6 sm:mb-8 rounded-lg sm:rounded-xl">
          <TabsTrigger value="overview" className="col-span-2 sm:col-span-1 text-xs sm:text-sm py-2 sm:py-2.5">Overview</TabsTrigger>
          <TabsTrigger value="reading" className="text-xs sm:text-sm py-2 sm:py-2.5">Reading</TabsTrigger>
          <TabsTrigger value="listening" className="text-xs sm:text-sm py-2 sm:py-2.5">Listening</TabsTrigger>
          <TabsTrigger value="writing" className="text-xs sm:text-sm py-2 sm:py-2.5">Writing</TabsTrigger>
          <TabsTrigger value="speaking" className="text-xs sm:text-sm py-2 sm:py-2.5">Speaking</TabsTrigger>
        </TabsList>

        {/* OVERVIEW CONTENT */}
        <TabsContent value="overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-0">
          {sections.map((s) => (
            <Card key={s.name} className="border-border/50 shadow-sm transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 pb-2">
                <CardTitle className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground truncate mr-2">{s.name}</CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${s.color}`}>{s.icon}</div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-0">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black">{s.score.toFixed(1)}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* READING REVIEW */}
        <TabsContent value="reading" className="mt-0">
           <ReviewSection title="Reading Answer Key" data={test.detailedReport?.reading} />
        </TabsContent>

        {/* LISTENING REVIEW */}
        <TabsContent value="listening" className="mt-0">
           <ReviewSection title="Listening Answer Key" data={test.detailedReport?.listening} />
        </TabsContent>

        {/* WRITING AI FEEDBACK - 🚀 RICH RENDER LOGIC ADDED HERE */}
        <TabsContent value="writing" className="mt-0">
          {(() => {
            const writingData = test.detailedReport?.writing?.aiFeedback;
            // Check if the backend gave us the new rich JSON object or an old fallback string
            const isRich = typeof writingData === 'object' && writingData !== null;
            
            if (!isRich) {
              return (
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                  <CardHeader className="p-4 sm:p-6 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> 
                      Examiner Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                      <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed break-words">
                        {writingData || "AI evaluation pending or not available for this session."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <div className="space-y-4 sm:space-y-6">
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
                  <CardHeader className="p-4 sm:p-6 pb-2 border-b border-border/30">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" /> 
                      Detailed Writing Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    
                    {/* The 4 Criteria Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      <ScoreMetric label="Task Response" score={writingData.taskResponseScore} />
                      <ScoreMetric label="Coherence" score={writingData.coherenceScore} />
                      <ScoreMetric label="Vocabulary" score={writingData.vocabularyScore} />
                      <ScoreMetric label="Grammar" score={writingData.grammarScore} />
                    </div>

                    <hr className="border-border/50" />
                    
                    {/* Overall Summary */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3">Overall Examiner Assessment</h4>
                      <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic border-l-4 border-primary/50 pl-3 sm:pl-4 py-1">
                        "{writingData.overallFeedback}"
                      </p>
                    </div>

                    {/* Actionable Suggestions */}
                    {writingData.suggestions && writingData.suggestions.length > 0 && (
                      <div className="bg-primary/5 rounded-xl p-4 sm:p-5 border border-primary/10">
                        <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-primary">
                          <Sparkles className="h-4 w-4" /> Actionable Improvements
                        </h4>
                        <ul className="space-y-2.5">
                          {writingData.suggestions.map((s: string, i: number) => (
                            <li key={i} className="flex gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                               <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">{i+1}</span>
                               <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* SPEAKING AI FEEDBACK */}
        <TabsContent value="speaking" className="mt-0">
          <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm">
            <CardHeader className="p-4 sm:p-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> 
                Speaking Transcription
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-1.5">
                Review your AI-transcribed response and feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
               <div className="p-3 sm:p-4 bg-background rounded-lg sm:rounded-xl border italic text-sm sm:text-base break-words">
                 "{test.detailedReport?.speaking?.transcription || "No transcription available."}"
               </div>
               <div className="p-3 sm:p-4 bg-emerald-500/10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium leading-relaxed break-words">
                 {test.detailedReport?.speaking?.aiFeedback || "Keep practicing to get AI fluency insights."}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 🚀 REUSABLE SUB-COMPONENT FOR LISTENING/READING TABLES
function ReviewSection({ title, data }: { title: string, data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-10 sm:p-12 text-center border-2 border-dashed border-border/60 rounded-2xl sm:rounded-3xl bg-card/50">
        <p className="font-bold text-muted-foreground text-sm sm:text-base">No question data recorded for this section.</p>
      </div>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="p-4 sm:p-6 border-b border-border/30">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {data.map((item: any, i: number) => (
            <div 
              key={i} 
              className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-xl border ${
                item.isCorrect 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-destructive/5 border-destructive/20'
              }`}
            >
              <div className="flex gap-3 sm:gap-4 items-start w-full pr-8 sm:pr-4">
                 <div className="font-bold text-muted-foreground w-6 shrink-0 mt-0.5 sm:mt-0 text-sm sm:text-base text-center">
                   Q{i+1}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm sm:text-base font-semibold leading-snug break-words mb-2 sm:mb-1">{item.question}</p>
                   
                   <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5 sm:mt-1">
                     <p className="text-xs sm:text-sm break-words">
                       <span className="text-muted-foreground">Your Answer:</span> 
                       <span className={`ml-1.5 font-bold ${item.isCorrect ? 'text-emerald-600' : 'text-destructive'}`}>
                         {item.userAnswer}
                       </span>
                     </p>
                     
                     {!item.isCorrect && (
                       <p className="text-xs sm:text-sm text-muted-foreground font-medium break-words border-l-0 sm:border-l sm:border-border/60 sm:pl-4 mt-0.5 sm:mt-0">
                         <span className="sm:hidden">Correct: </span>
                         <span className="hidden sm:inline">Correct: </span>
                         <span className="text-emerald-600 ml-1.5 font-bold">{item.correctAnswer}</span>
                       </p>
                     )}
                   </div>
                 </div>
              </div>
              
              <div className="absolute top-4 right-4 sm:static sm:top-auto sm:right-auto shrink-0">
                {item.isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 🚀 METRIC COMPONENT FOR THE RICH WRITING RENDER
function ScoreMetric({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{label}</span>
        <span className="text-sm sm:text-base font-black text-foreground">{score || 0}/9.0</span>
      </div>
      <div className="h-1.5 sm:h-2 bg-muted rounded-none w-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${((score || 0) / 9) * 100}%` }} />
      </div>
    </div>
  );
}