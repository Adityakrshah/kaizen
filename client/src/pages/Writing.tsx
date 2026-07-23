// import { useState } from "react";
// import { 
//   PenLine, Send, Loader2, AlertCircle, 
//   Info, ChevronRight, RotateCcw,
//   Sparkles, ClipboardCheck, Layout, RefreshCw
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Progress } from "@/components/ui/progress";
// import { 
//   Dialog, DialogContent, DialogDescription, 
//   DialogHeader, DialogTitle, DialogTrigger 
// } from "@/components/ui/dialog";
// import axios from "axios";

// // Fallback prompts until you connect a database table for Writing Prompts
// const TASK_2_PROMPTS = [
//   "In many countries, people are moving from rural areas to big cities. Does this development have more advantages or disadvantages?",
//   "Some people believe that university education should be free for everyone, regardless of their background. To what extent do you agree or disagree?",
//   "The rapid development of artificial intelligence is changing the way we work and live. Do the advantages of AI outweigh the disadvantages?",
//   "Many people prefer to watch foreign films rather than locally produced ones. Why could this be? Should governments give more financial support to local film industries?"
// ];

// export function Writing() {
//   const [content, setContent] = useState("");
//   const [status, setStatus] = useState<"typing" | "submitting" | "finished">("typing");
//   const [results, setResults] = useState<any>(null);
//   const [taskType, setTaskType] = useState<"task1" | "task2">("task2");
  
//   // State for the active prompt
//   const [promptIndex, setPromptIndex] = useState(0);
//   const activePrompt = TASK_2_PROMPTS[promptIndex];

//   const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
//   const targetWords = taskType === "task2" ? 250 : 150;
//   const progress = Math.min((wordCount / targetWords) * 100, 100);

//   // The new Skip function
//   const handleSkipPrompt = () => {
//     setPromptIndex((prev) => (prev + 1) % TASK_2_PROMPTS.length);
//     setContent(""); // Clear the editor when they skip
//   };

//   const handleSubmit = async () => {
//     if (wordCount < 50) return alert("Please write at least 50 words for an accurate evaluation.");
//     setStatus("submitting");

//     try {
//       const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/writing/submit`, {
//         content,
//         prompt: activePrompt,
//         taskType
//       }, { withCredentials: true });

//       if (res.data.success) {
//         setResults(res.data.data.aiEvaluation);
//         setStatus("finished");
//       }
//     } catch (err) {
//       setStatus("typing");
//       alert("Submission failed. Ensure your server is running on port 5000.");
//     }
//   };

//   if (status === "finished") {
//     return (
//       <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20 px-4 mt-10">
//         <div className="text-center space-y-4">
//           <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
//             <ClipboardCheck className="h-8 w-8 text-primary" />
//           </div>
//           <h1 className="text-4xl font-black tracking-tight">Expert Evaluation</h1>
//           <p className="text-muted-foreground text-lg">Your essay has been graded against official IELTS standards.</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card className="md:col-span-1 bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center p-10 border-none relative overflow-hidden">
//              <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="h-20 w-20" /></div>
//              <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Estimated Band</p>
//              <div className="text-8xl font-black tracking-tighter">{results?.bandScore || "7.5"}</div>
//              <Badge variant="secondary" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1 uppercase font-bold tracking-tighter italic">Official Level</Badge>
//           </Card>

//           <Card className="md:col-span-2 p-8 space-y-8 bg-card/40 backdrop-blur-sm border-border/50">
//             <div className="grid grid-cols-2 gap-8">
//               <ScoreMetric label="Task Response" score={results?.taskResponseScore || 7.5} />
//               <ScoreMetric label="Coherence" score={results?.coherenceScore || 7.0} />
//               <ScoreMetric label="Vocabulary" score={results?.vocabularyScore || 7.5} />
//               <ScoreMetric label="Grammar" score={results?.grammarScore || 8.0} />
//             </div>
//             <hr className="border-border/50" />
//             <div>
//               <h4 className="font-bold flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-primary" /> Key Improvement Areas</h4>
//               <ul className="space-y-3">
//                 {results?.suggestions?.slice(0, 3).map((s: string, i: number) => (
//                   <li key={i} className="text-sm text-muted-foreground flex gap-3 leading-relaxed">
//                     <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] shrink-0 font-bold">{i+1}</span>
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </Card>
//         </div>

//         <Card className="p-8 bg-muted/20 border-border/50">
//            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><PenLine className="h-5 w-5" /> Examiner Feedback</h3>
//            <p className="text-muted-foreground leading-relaxed text-lg italic">"{results?.overallFeedback}"</p>
//         </Card>

//         <div className="flex justify-center gap-4">
//           <Button variant="outline" size="lg" onClick={() => { setStatus("typing"); setContent(""); }} className="px-8 border-border">
//             <RotateCcw className="mr-2 h-4 w-4" /> Write New Essay
//           </Button>
          
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button size="lg" className="px-8 shadow-lg shadow-primary/20">
//                 View Detailed Report <ChevronRight className="ml-2 h-4 w-4" />
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
//               <DialogHeader>
//                 <DialogTitle className="text-2xl font-bold">Comprehensive Evaluation</DialogTitle>
//                 <DialogDescription>A detailed breakdown of your writing performance.</DialogDescription>
//               </DialogHeader>
              
//               <div className="space-y-6 pt-4">
//                 <ReportSection title="Task Response" content={results?.taskResponse} />
//                 <ReportSection title="Cohesion & Coherence" content={results?.coherence} />
//                 <ReportSection title="Lexical Resource" content={results?.vocabulary} />
//                 <ReportSection title="Grammar Range & Accuracy" content={results?.grammar} />
                
//                 <div className="bg-muted/50 p-5 rounded-xl border border-border/50">
//                   <h4 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/> All Expert Suggestions</h4>
//                   <ul className="text-sm space-y-3">
//                      {results?.suggestions?.map((s: string, i: number) => (
//                        <li key={i} className="flex gap-2 text-muted-foreground leading-relaxed">
//                          <span className="text-primary">•</span> {s}
//                        </li>
//                      ))}
//                   </ul>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>

//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-500 overflow-hidden">
//       {/* Top Navigation / Stats Bar */}
//       <div className="bg-card border-b border-border/40 px-8 py-4 flex justify-between items-center shrink-0">
//         <div className="flex items-center gap-6">
//           <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-mono uppercase tracking-tighter">
//             {taskType === "task2" ? "Writing Task 2: Essay" : "Writing Task 1: Report"}
//           </Badge>
//           <div className="h-4 w-px bg-border/50" />
//           <div className="flex items-center gap-2">
//             <Layout className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm font-medium text-muted-foreground">Standard Mode</span>
//           </div>
//         </div>

//         <div className="flex items-center gap-8">
//            <div className="text-right">
//               <div className="flex items-center gap-2 justify-end">
//                 <span className={`text-xl font-black transition-colors duration-300 ${wordCount < targetWords ? 'text-amber-500' : 'text-emerald-500'}`}>{wordCount}</span>
//                 <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">/ {targetWords} Words</span>
//               </div>
//               <Progress value={progress} className="h-1.5 w-32 mt-1" />
//            </div>
//            <Button onClick={handleSubmit} disabled={status === "submitting" || wordCount < 10} className="h-12 px-8 shadow-lg shadow-primary/20">
//               {status === "submitting" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
//               {status === "submitting" ? "Grading..." : "Submit Test"}
//            </Button>
//         </div>
//       </div>

//       {/* Main Dual-Pane Content */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Left: Prompt Area */}
//         <div className="w-[400px] border-r border-border/40 bg-muted/10 overflow-y-auto p-10 custom-scrollbar flex flex-col">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Writing Prompt</h3>
//               {/* 🚀 THE SKIP BUTTON */}
//               <Button variant="ghost" size="sm" onClick={handleSkipPrompt} className="h-8 text-muted-foreground hover:text-primary">
//                 <RefreshCw className="h-4 w-4 mr-2" /> Skip
//               </Button>
//             </div>
            
//             <div className="prose prose-invert flex-1">
//                 <p className="text-xl font-medium leading-relaxed italic text-foreground/90">"{activePrompt}"</p>
//                 <div className="mt-10 p-6 bg-card border border-border/50 rounded-xl space-y-4 shadow-sm">
//                    <h4 className="text-xs font-bold uppercase text-primary flex items-center gap-2"><Info className="h-4 w-4" /> Exam Instructions</h4>
//                    <ul className="text-sm text-muted-foreground space-y-2 list-none p-0">
//                       <li>• Spend about {taskType === "task2" ? "40" : "20"} minutes on this task.</li>
//                       <li>• Write in a formal, academic style.</li>
//                       <li>• Provide reasons and examples for your answer.</li>
//                    </ul>
//                 </div>
//             </div>
//         </div>

//         {/* Right: Editor Area */}
//         <div className="flex-1 bg-background relative flex flex-col overflow-hidden">
//             <Textarea 
//               placeholder="Type your response here..."
//               className="flex-1 w-full border-none focus-visible:ring-0 p-12 text-xl leading-relaxed bg-transparent resize-none font-serif custom-scrollbar"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               disabled={status === "submitting"}
//               spellCheck={false}
//             />
//             <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-background to-transparent pointer-events-none" />
//         </div>
//       </div>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//       `}</style>
//     </div>
//   );
// }

// // Helper Components
// function ScoreMetric({ label, score }: { label: string; score: number }) {
//   return (
//     <div className="space-y-2">
//       <div className="flex justify-between items-end">
//         <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">{label}</span>
//         <span className="text-lg font-black text-foreground">{score}/9.0</span>
//       </div>
//       <Progress value={(score / 9) * 100} className="h-2 bg-muted rounded-none" />
//     </div>
//   );
// }

// function ReportSection({ title, content }: { title: string; content: string }) {
//   return (
//     <div className="border-b border-border/50 pb-5 last:border-0 last:pb-0">
//       <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{title}</h4>
//       <p className="text-sm leading-relaxed text-muted-foreground">{content || "No specific feedback provided by AI for this section."}</p>
//     </div>
//   );
// }

import { useState } from "react";
import { 
  PenLine, Send, Loader2, AlertCircle, 
  Info, ChevronRight, RotateCcw,
  Sparkles, ClipboardCheck, Layout, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import axios from "axios";

// Fallback prompts until you connect a database table for Writing Prompts
const TASK_2_PROMPTS = [
  "In many countries, people are moving from rural areas to big cities. Does this development have more advantages or disadvantages?",
  "Some people believe that university education should be free for everyone, regardless of their background. To what extent do you agree or disagree?",
  "The rapid development of artificial intelligence is changing the way we work and live. Do the advantages of AI outweigh the disadvantages?",
  "Many people prefer to watch foreign films rather than locally produced ones. Why could this be? Should governments give more financial support to local film industries?"
];

export function Writing() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"typing" | "submitting" | "finished">("typing");
  const [results, setResults] = useState<any>(null);
  const [taskType, setTaskType] = useState<"task1" | "task2">("task2");
  
  // State for the active prompt
  const [promptIndex, setPromptIndex] = useState(0);
  const activePrompt = TASK_2_PROMPTS[promptIndex];

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const targetWords = taskType === "task2" ? 250 : 150;
  const progress = Math.min((wordCount / targetWords) * 100, 100);

  // The new Skip function
  const handleSkipPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % TASK_2_PROMPTS.length);
    setContent(""); // Clear the editor when they skip
  };

  const handleSubmit = async () => {
    if (wordCount < 50) return alert("Please write at least 50 words for an accurate evaluation.");
    setStatus("submitting");

    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/writing/submit`, {
        content,
        prompt: activePrompt,
        taskType
      }, { withCredentials: true });

      if (res.data.success) {
        setResults(res.data.data.aiEvaluation);
        setStatus("finished");
      }
    } catch (err) {
      setStatus("typing");
      alert("Submission failed. Ensure your server is running on port 5000.");
    }
  };

  if (status === "finished") {
    return (
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in duration-500 pb-20 px-4 mt-6 sm:mt-10">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-1 sm:mb-2">
            <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Expert Evaluation</h1>
          <p className="text-muted-foreground text-sm sm:text-lg px-4">Your essay has been graded against official IELTS standards.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-1 bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center p-8 sm:p-10 border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="h-16 w-16 sm:h-20 sm:w-20" /></div>
             <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Estimated Band</p>
             <div className="text-6xl sm:text-8xl font-black tracking-tighter">{results?.bandScore || "7.5"}</div>
             <Badge variant="secondary" className="mt-3 sm:mt-4 bg-white/20 hover:bg-white/30 text-white border-none px-3 sm:px-4 py-1 uppercase font-bold tracking-tighter italic text-[10px] sm:text-xs">Official Level</Badge>
          </Card>

          <Card className="lg:col-span-2 p-5 sm:p-8 space-y-6 sm:space-y-8 bg-card/40 backdrop-blur-sm border-border/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <ScoreMetric label="Task Response" score={results?.taskResponseScore || 7.5} />
              <ScoreMetric label="Coherence" score={results?.coherenceScore || 7.0} />
              <ScoreMetric label="Vocabulary" score={results?.vocabularyScore || 7.5} />
              <ScoreMetric label="Grammar" score={results?.grammarScore || 8.0} />
            </div>
            <hr className="border-border/50" />
            <div>
              <h4 className="font-bold flex items-center gap-2 mb-3 text-sm sm:text-base"><AlertCircle className="h-4 w-4 text-primary" /> Key Improvement Areas</h4>
              <ul className="space-y-3">
                {results?.suggestions?.slice(0, 3).map((s: string, i: number) => (
                  <li key={i} className="text-xs sm:text-sm text-muted-foreground flex gap-2 sm:gap-3 leading-relaxed">
                    <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 font-bold mt-0.5">{i+1}</span>
                    <span className="flex-1">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <Card className="p-5 sm:p-8 bg-muted/20 border-border/50">
           <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2"><PenLine className="h-4 w-4 sm:h-5 sm:w-5" /> Examiner Feedback</h3>
           <p className="text-muted-foreground leading-relaxed text-sm sm:text-lg italic">"{results?.overallFeedback}"</p>
        </Card>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
          <Button variant="outline" size="lg" onClick={() => { setStatus("typing"); setContent(""); }} className="px-8 border-border w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" /> Write New Essay
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
                View Detailed Report <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[85vh] overflow-y-auto custom-scrollbar p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold">Comprehensive Evaluation</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">A detailed breakdown of your writing performance.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-5 sm:space-y-6 pt-2 sm:pt-4">
                <ReportSection title="Task Response" content={results?.taskResponse} />
                <ReportSection title="Cohesion & Coherence" content={results?.coherence} />
                <ReportSection title="Lexical Resource" content={results?.vocabulary} />
                <ReportSection title="Grammar Range & Accuracy" content={results?.grammar} />
                
                <div className="bg-muted/50 p-4 sm:p-5 rounded-xl border border-border/50">
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base"><Sparkles className="h-4 w-4 text-primary"/> All Expert Suggestions</h4>
                  <ul className="text-xs sm:text-sm space-y-2.5 sm:space-y-3">
                     {results?.suggestions?.map((s: string, i: number) => (
                       <li key={i} className="flex gap-2 text-muted-foreground leading-relaxed">
                         <span className="text-primary shrink-0">•</span> 
                         <span>{s}</span>
                       </li>
                     ))}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Top Navigation / Stats Bar */}
      <div className="bg-card border-b border-border/40 px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 shrink-0">
        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3 sm:gap-6">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-2 sm:px-3 py-1 font-mono uppercase tracking-tighter text-[10px] sm:text-xs truncate">
            {taskType === "task2" ? "Writing Task 2: Essay" : "Writing Task 1: Report"}
          </Badge>
          <div className="hidden sm:block h-4 w-px bg-border/50" />
          <div className="hidden sm:flex items-center gap-2">
            <Layout className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Standard Mode</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-8 mt-1 sm:mt-0">
           <div className="text-left sm:text-right flex-1 sm:flex-none">
              <div className="flex items-center gap-1.5 sm:gap-2 justify-start sm:justify-end">
                <span className={`text-lg sm:text-xl font-black transition-colors duration-300 ${wordCount < targetWords ? 'text-amber-500' : 'text-emerald-500'}`}>{wordCount}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-tighter">/ {targetWords} Words</span>
              </div>
              <Progress value={progress} className="h-1.5 w-full sm:w-32 mt-1" />
           </div>
           <Button onClick={handleSubmit} disabled={status === "submitting" || wordCount < 10} className="h-10 sm:h-12 px-4 sm:px-8 text-xs sm:text-sm shadow-lg shadow-primary/20 shrink-0">
              {status === "submitting" ? <Loader2 className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
              {status === "submitting" ? "Grading..." : "Submit Test"}
           </Button>
        </div>
      </div>

      {/* Main Dual-Pane Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Prompt Area */}
        <div className="w-full lg:w-[350px] xl:w-[400px] h-[30vh] min-h-[150px] lg:h-full lg:min-h-0 border-b lg:border-b-0 lg:border-r border-border/40 bg-muted/10 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">Writing Prompt</h3>
              {/* 🚀 THE SKIP BUTTON */}
              <Button variant="ghost" size="sm" onClick={handleSkipPrompt} className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:text-primary">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 sm:mr-2" /> Skip
              </Button>
            </div>
            
            <div className="prose prose-sm sm:prose-base lg:prose-lg prose-invert flex-1">
                <p className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed italic text-foreground/90 break-words">"{activePrompt}"</p>
                <div className="mt-6 lg:mt-10 p-4 sm:p-6 bg-card border border-border/50 rounded-xl space-y-3 sm:space-y-4 shadow-sm">
                   <h4 className="text-[10px] sm:text-xs font-bold uppercase text-primary flex items-center gap-1.5 sm:gap-2"><Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Exam Instructions</h4>
                   <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2 list-none p-0">
                      <li>• Spend about {taskType === "task2" ? "40" : "20"} minutes on this task.</li>
                      <li>• Write in a formal, academic style.</li>
                      <li>• Provide reasons and examples for your answer.</li>
                   </ul>
                </div>
            </div>
        </div>

        {/* Right: Editor Area */}
        <div className="flex-1 bg-background relative flex flex-col overflow-hidden min-h-[40vh] lg:min-h-0">
            <Textarea 
              placeholder="Type your response here..."
              className="flex-1 w-full border-none focus-visible:ring-0 p-4 sm:p-8 lg:p-12 text-base sm:text-lg lg:text-xl leading-relaxed bg-transparent resize-none font-serif custom-scrollbar"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={status === "submitting"}
              spellCheck={false}
            />
            <div className="absolute top-0 left-0 w-full h-6 sm:h-10 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        @media (min-width: 640px) { .custom-scrollbar::-webkit-scrollbar { width: 6px; } }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// Helper Components
function ScoreMetric({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-muted-foreground">{label}</span>
        <span className="text-base sm:text-lg font-black text-foreground">{score}/9.0</span>
      </div>
      <Progress value={(score / 9) * 100} className="h-1.5 sm:h-2 bg-muted rounded-none" />
    </div>
  );
}

function ReportSection({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-b border-border/50 pb-4 sm:pb-5 last:border-0 last:pb-0">
      <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-1.5 sm:mb-2">{title}</h4>
      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{content || "No specific feedback provided by AI for this section."}</p>
    </div>
  );
}