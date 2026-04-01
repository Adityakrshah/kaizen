import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, ArrowLeft, Award, BookOpen, Headphones, 
  PenTool, Mic, CheckCircle2, XCircle, BrainCircuit 
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
        const res = await fetch(`http://localhost:5000/api/mocktest/${id}`, { credentials: "include" });
        const result = await res.json();
        if (result.success) setTest(result.data);
      } catch (err) {
        console.error("Failed to fetch test details");
      } finally { setLoading(false); }
    }
    fetchTest();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!test) return <div className="p-10 text-center">Test not found.</div>;

  const sections = [
    { name: "Reading", score: test.sections?.reading?.score || 0, icon: <BookOpen className="text-blue-500"/>, color: "bg-blue-500/10" },
    { name: "Listening", score: test.sections?.listening?.score || 0, icon: <Headphones className="text-purple-500"/>, color: "bg-purple-500/10" },
    { name: "Writing", score: test.sections?.writing?.score || 0, icon: <PenTool className="text-orange-500"/>, color: "bg-orange-500/10" },
    { name: "Speaking", score: test.sections?.speaking?.score || 0, icon: <Mic className="text-emerald-500"/>, color: "bg-emerald-500/10" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Dashboard
        </Button>
        <Badge variant="outline" className="font-mono uppercase tracking-widest text-[10px]">
          TEST_ID: {id?.substring(0, 8)}...
        </Badge>
      </div>

      {/* 2. OVERALL SCORE BANNER */}
      <div className="bg-card border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-8 ring-primary/5">
            <Award className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter">Band {test.overallBand || 0}</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs mt-1">Overall Band Score</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-muted-foreground">COMPLETED ON</p>
          <p className="text-lg font-bold">{new Date(test.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="listening">Listening</TabsTrigger>
          <TabsTrigger value="writing">Writing</TabsTrigger>
          <TabsTrigger value="speaking">Speaking</TabsTrigger>
        </TabsList>

        {/* OVERVIEW CONTENT */}
        <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s) => (
            <Card key={s.name} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground">{s.name}</CardTitle>
                <div className={`p-2 rounded-lg ${s.color}`}>{s.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black">{s.score.toFixed(1)}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* READING REVIEW */}
        <TabsContent value="reading">
           <ReviewSection title="Reading Answer Key" data={test.detailedReport?.reading} />
        </TabsContent>

        {/* LISTENING REVIEW */}
        <TabsContent value="listening">
           <ReviewSection title="Listening Answer Key" data={test.detailedReport?.listening} />
        </TabsContent>

        {/* WRITING AI FEEDBACK */}
        <TabsContent value="writing">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5" /> Examiner Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-lg font-medium leading-relaxed">{test.detailedReport?.writing?.aiFeedback || "AI evaluation pending or not available for this session."}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPEAKING AI FEEDBACK */}
        <TabsContent value="speaking">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Speaking Transcription</CardTitle>
              <CardDescription>Review your AI-transcribed response and feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="p-4 bg-background rounded-lg border italic">
                 "{test.detailedReport?.speaking?.transcription || "No transcription available."}"
               </div>
               <div className="p-4 bg-emerald-500/10 rounded-lg text-sm font-medium">
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
      <div className="p-12 text-center border-2 border-dashed rounded-3xl opacity-50">
        <p className="font-bold">No question data recorded for this section.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item: any, i: number) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${item.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-destructive/5 border-destructive/20'}`}>
              <div className="flex gap-4">
                 <div className="font-bold text-muted-foreground w-6">Q{i+1}</div>
                 <div>
                   <p className="text-sm font-semibold">{item.question}</p>
                   <p className="text-xs mt-1">
                     <span className="text-muted-foreground">Your Answer:</span> <span className={item.isCorrect ? 'text-emerald-600' : 'text-destructive'}>{item.userAnswer}</span>
                   </p>
                   {!item.isCorrect && (
                     <p className="text-xs text-muted-foreground mt-0.5 font-medium">Correct: {item.correctAnswer}</p>
                   )}
                 </div>
              </div>
              {item.isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-destructive" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}