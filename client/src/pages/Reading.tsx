// import { useState, useEffect } from "react";
// import { BookText, Clock, CheckCircle2, Play, ArrowLeft, Loader2, Sparkles, Wand2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import axios from "axios";

// export function Reading() {
//   const [view, setView] = useState<"library" | "menu" | "active">("library");
//   const [mode, setMode] = useState<"practice" | "test">("test");
//   const [testStatus, setTestStatus] = useState<"ready" | "in-progress" | "finished">("ready");
  
//   const [passages, setPassages] = useState<any[]>([]);
//   const [activeTest, setActiveTest] = useState<any>(null);
//   const [answers, setAnswers] = useState<string[]>([]);
//   const [results, setResults] = useState<any>(null);
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [isGeneratingQs, setIsGeneratingQs] = useState(false);
  
//   const [timeLeft, setTimeLeft] = useState(3600); 

//   useEffect(() => { fetchLibrary(); }, []);

//   const fetchLibrary = async () => {
//     try {
//       setIsLoading(true);
//       const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/reading`, { withCredentials: true });
//       if (res.data.success) setPassages(res.data.data);
//     } catch (error) {
//       console.error("Failed to fetch library", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     let timer: ReturnType<typeof setInterval>;
//     if (view === "active" && mode === "test" && testStatus === "in-progress" && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     } else if (timeLeft === 0 && testStatus === "in-progress") {
//       finishTest(); 
//     }
//     return () => clearInterval(timer);
//   }, [view, mode, testStatus, timeLeft]);

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m}:${s < 10 ? '0' : ''}${s}`;
//   };

//   const generateNewTest = async () => {
//     try {
//       setIsGenerating(true);
//       const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/reading/generate`, {}, { withCredentials: true });
//       if (res.data.success) {
//         await fetchLibrary(); 
//         selectPassage(res.data.data._id); 
//       }
//     } catch (error) {
//       console.error("Generation failed", error);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const selectPassage = async (id: string) => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/reading/${id}`, { withCredentials: true });
//       if (res.data.success) {
//         setActiveTest(res.data.data);
//         setAnswers(new Array(res.data.data.questions?.length || 0).fill(""));
//         setResults(null);
//         setView("menu"); 
//       }
//     } catch (error) {
//       console.error("Failed to load passage", error);
//     }
//   };

//   const generateQuestionsForPassage = async () => {
//     try {
//       setIsGeneratingQs(true);
//       const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/reading/${activeTest._id}/questions`, {}, { withCredentials: true });
//       if (res.data.success) {
//         setActiveTest(res.data.data);
//         setAnswers(new Array(res.data.data.questions.length).fill(""));
//       }
//     } catch (error) {
//       console.error("Failed to generate questions", error);
//     } finally {
//       setIsGeneratingQs(false);
//     }
//   };

//   const startModule = (selectedMode: "practice" | "test") => {
//     setMode(selectedMode);
//     setView("active");
//     setTestStatus("ready");
//     setTimeLeft(3600);
//   };

//   const finishTest = async () => {
//     setTestStatus("finished");
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/reading/submit`, {
//         passageId: activeTest._id,
//         answers: answers
//       }, { withCredentials: true });
//       if (res.data.success) setResults(res.data);
//     } catch (error) {
//       console.error("Failed to submit answers", error);
//     }
//   };

//   const updateAnswer = (index: number, value: string) => {
//     const newAnswers = [...answers];
//     newAnswers[index] = value;
//     setAnswers(newAnswers);
//   };

//   const standardTests = passages.filter(p => !p.isAiGenerated);
//   const aiTests = passages.filter(p => p.isAiGenerated);

//   if (view === "library") {
//     return (
//       <div className="max-w-7xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500 px-4">
//         <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
//           <div>
//             <h1 className="text-4xl font-bold tracking-tight text-foreground">Reading Library</h1>
//             <p className="text-muted-foreground mt-2">Practice from 1,400+ standard tests or generate a custom AI test.</p>
//           </div>
//           <Button onClick={generateNewTest} disabled={isGenerating} size="lg" className="bg-primary shadow-lg shadow-primary/20">
//             {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
//             {isGenerating ? "Writing Essay..." : "Generate AI Test"}
//           </Button>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
//         ) : (
//           <Tabs defaultValue="standard" className="w-full">
//             <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12">
//               <TabsTrigger value="standard" className="text-base">Standard Library ({standardTests.length})</TabsTrigger>
//               <TabsTrigger value="ai" className="text-base">My AI Tests ({aiTests.length})</TabsTrigger>
//             </TabsList>

//             <TabsContent value="standard" className="mt-0">
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {standardTests.map((p, index) => (
//                   <Card key={p._id} className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50" onClick={() => selectPassage(p._id)}>
//                     <CardHeader className="p-5">
//                       <div className="flex justify-between items-start mb-3">
//                         <BookText className="h-5 w-5 text-muted-foreground" />
//                         <Badge variant="secondary">Standard</Badge>
//                       </div>
//                       <CardTitle className="text-base leading-snug">
//                         {p.title === "Reading Practice" ? `Standard Passage #${index + 1}` : p.title}
//                       </CardTitle>
//                     </CardHeader>
//                   </Card>
//                 ))}
//               </div>
//             </TabsContent>

//             <TabsContent value="ai" className="mt-0">
//               {aiTests.length === 0 ? (
//                 <div className="text-center py-20 border border-dashed border-border/50 rounded-xl bg-card/20">
//                   <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
//                   <h3 className="text-lg font-medium text-foreground">No AI Tests Yet</h3>
//                   <p className="text-muted-foreground">Click the generate button above to create your first custom reading passage.</p>
//                 </div>
//               ) : (
//                 <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                   {aiTests.map((p) => (
//                     <Card key={p._id} className="cursor-pointer hover:border-blue-500/50 transition-colors bg-blue-500/5" onClick={() => selectPassage(p._id)}>
//                       <CardHeader className="p-5">
//                         <div className="flex justify-between items-start mb-3">
//                           <BookText className="h-5 w-5 text-blue-500/70" />
//                           <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">AI Generated</Badge>
//                         </div>
//                         <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
//                       </CardHeader>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         )}
//       </div>
//     );
//   }

//   if (view === "menu") {
//     return (
//       <div className="max-w-4xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500">
//         <Button variant="ghost" onClick={() => setView("library")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Library</Button>
//         <div className="text-center space-y-4 mb-12">
//           <Badge variant="outline" className="px-3 py-1 text-primary border-primary/30 bg-primary/10">Reading Module</Badge>
//           <h1 className="text-4xl font-bold tracking-tight">Choose your session</h1>
//           <p className="text-muted-foreground text-lg">Decide how you want to study today.</p>
//         </div>
//         <div className="grid md:grid-cols-2 gap-6">
//           <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => startModule("practice")}>
//             <CardHeader className="text-center py-10"><CardTitle>Practice Mode (Untimed)</CardTitle></CardHeader>
//           </Card>
//           <Card className="cursor-pointer hover:border-primary/50 bg-primary/5 transition-all" onClick={() => startModule("test")}>
//             <CardHeader className="text-center py-10"><CardTitle className="text-primary">Mock Test (60 Min)</CardTitle></CardHeader>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col relative px-4 pt-4">
//       <div className="flex justify-between items-center gap-4 shrink-0">
//         <div className="flex items-center gap-4">
//           <Button variant="ghost" size="icon" onClick={() => setView("library")}><ArrowLeft className="h-5 w-5" /></Button>
//           <div>
//             <Badge variant="secondary" className="mb-1">{activeTest?.isAiGenerated ? "AI Essay" : "Standard Essay"}</Badge>
//             <h1 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{activeTest?.title}</h1>
//           </div>
//         </div>
//         {mode === "test" && (
//           <div className={`flex items-center gap-2 text-xl font-mono font-bold px-4 py-2 rounded-lg border shadow-sm ${timeLeft < 300 ? "text-destructive border-destructive/50 bg-destructive/10 animate-pulse" : "bg-card border-border/50"}`}>
//             <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
//           </div>
//         )}
//       </div>

//       {testStatus === "ready" && (
//         <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm mt-16 border border-border/50 rounded-xl">
//           <Card className="max-w-md w-full shadow-2xl bg-card text-center p-8">
//             <CardTitle className="text-3xl mb-4">Ready to begin?</CardTitle>
//             <p className="text-muted-foreground mb-8">Make sure you are focused and ready to read.</p>
//             <Button size="lg" onClick={() => setTestStatus("in-progress")} className="w-full h-14 text-lg bg-primary">Start {mode === "test" ? "Timer" : "Practice"}</Button>
//           </Card>
//         </div>
//       )}

//       <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 transition-opacity duration-500 ${testStatus === "ready" ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        
//         {/* Left: Reading Passage (Smooth Scroll) */}
//         <Card className="bg-card/40 border-border/50 flex flex-col h-full overflow-hidden shadow-sm">
//           <CardContent className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
//             <h2 className="text-2xl font-bold font-serif mb-6">{activeTest?.title}</h2>
//             <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed space-y-6 text-lg">
//               {activeTest?.passage?.split('\n').map((para: string, i: number) => (
//                 para.trim() && <p key={i}>{para}</p>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Right: Dynamic Questions Form (Smooth Scroll) */}
//         <Card className="bg-card/40 border-border/50 flex flex-col h-full overflow-hidden shadow-sm">
//           <CardHeader className="border-b border-border/40 pb-4 shrink-0 bg-muted/30 flex flex-row items-center justify-between">
//             <div><CardTitle>Questions</CardTitle></div>
//             {testStatus === "finished" && results && (
//               <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-lg px-3 py-1">
//                 Score: {results.correctAnswers}/{results.totalQuestions}
//               </Badge>
//             )}
//           </CardHeader>
          
//           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            
//             {/* NO QUESTIONS FALLBACK */}
//             {(!activeTest?.questions || activeTest.questions.length === 0) ? (
//               <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
//                 <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
//                   <Wand2 className="h-8 w-8 text-muted-foreground" />
//                 </div>
//                 <h3 className="text-xl font-bold">No Questions Found</h3>
//                 <p className="text-muted-foreground max-w-sm">This is an older standard passage without pre-saved questions.</p>
//                 <Button onClick={generateQuestionsForPassage} disabled={isGeneratingQs} className="bg-blue-600 hover:bg-blue-700 mt-4">
//                   {isGeneratingQs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
//                   {isGeneratingQs ? "Analyzing Text & Writing Questions..." : "Generate AI Questions for this Passage"}
//                 </Button>
//               </div>
//             ) : (
//               // NORMAL QUESTIONS RENDER
//               <div className="space-y-10">
//                 {activeTest?.questions.map((q: any, i: number) => (
//                   <div key={i} className="space-y-4 pb-6 border-b border-border/40">
//                     <Label className="text-base font-semibold leading-relaxed">
//                       {i + 1}. {q.question}
//                       {testStatus === "finished" && results && (
//                         <span className={`ml-2 text-sm font-bold ${results.results[i].isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
//                           {results.results[i].isCorrect ? " ✓ Correct" : ` ✗ Incorrect (Answer: ${q.correctAnswer})`}
//                         </span>
//                       )}
//                     </Label>

//                     {q.type === "fill_blank" ? (
//                       <Input 
//                         value={answers[i] || ""} 
//                         onChange={(e) => updateAnswer(i, e.target.value)}
//                         disabled={testStatus === "finished"}
//                         placeholder="Type your answer..." 
//                         className="max-w-xs bg-background"
//                       />
//                     ) : (
//                       <RadioGroup 
//                         disabled={testStatus === "finished"} 
//                         value={answers[i] || ""} 
//                         onValueChange={(val) => updateAnswer(i, val)}
//                         className="space-y-3 pl-2"
//                       >
//                         {(q.type === "true_false_not_given" ? ["TRUE", "FALSE", "NOT GIVEN"] : q.options).map((opt: string, optIdx: number) => (
//                           <div key={optIdx} className="flex items-center space-x-3 bg-muted/20 p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors">
//                             <RadioGroupItem value={opt} id={`q${i}-${optIdx}`} />
//                             <Label htmlFor={`q${i}-${optIdx}`} className="cursor-pointer flex-1 text-sm leading-relaxed">{opt}</Label>
//                           </div>
//                         ))}
//                       </RadioGroup>
//                     )}
//                   </div>
//                 ))}

//                 {testStatus === "in-progress" && (
//                   <Button onClick={finishTest} size="lg" className="w-full bg-primary text-primary-foreground shadow-lg">
//                     Submit Final Answers
//                   </Button>
//                 )}
//               </div>
//             )}
//           </div>
//         </Card>
//       </div>
      
//       {/* CSS For Buttery Smooth Scrolling */}
//       <style>{`
//         .custom-scrollbar {
//           scroll-behavior: smooth;
//           -webkit-overflow-scrolling: touch;
//         }
//         .custom-scrollbar::-webkit-scrollbar { width: 8px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--border)); border-radius: 20px; }
//         .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: hsl(var(--muted-foreground) / 0.5); }
//       `}</style>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { BookText, Clock, CheckCircle2, Play, ArrowLeft, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";

export function Reading() {
  const [view, setView] = useState<"library" | "menu" | "active">("library");
  const [mode, setMode] = useState<"practice" | "test">("test");
  const [testStatus, setTestStatus] = useState<"ready" | "in-progress" | "finished">("ready");
  
  const [passages, setPassages] = useState<any[]>([]);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQs, setIsGeneratingQs] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(3600); 

  useEffect(() => { fetchLibrary(); }, []);

  const fetchLibrary = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/reading`, { withCredentials: true });
      if (res.data.success) setPassages(res.data.data);
    } catch (error) {
      console.error("Failed to fetch library", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (view === "active" && mode === "test" && testStatus === "in-progress" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && testStatus === "in-progress") {
      finishTest(); 
    }
    return () => clearInterval(timer);
  }, [view, mode, testStatus, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const generateNewTest = async () => {
    try {
      setIsGenerating(true);
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/reading/generate`, {}, { withCredentials: true });
      if (res.data.success) {
        await fetchLibrary(); 
        selectPassage(res.data.data._id); 
      }
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPassage = async (id: string) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/reading/${id}`, { withCredentials: true });
      if (res.data.success) {
        setActiveTest(res.data.data);
        setAnswers(new Array(res.data.data.questions?.length || 0).fill(""));
        setResults(null);
        setView("menu"); 
      }
    } catch (error) {
      console.error("Failed to load passage", error);
    }
  };

  const generateQuestionsForPassage = async () => {
    try {
      setIsGeneratingQs(true);
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/reading/${activeTest._id}/questions`, {}, { withCredentials: true });
      if (res.data.success) {
        setActiveTest(res.data.data);
        setAnswers(new Array(res.data.data.questions.length).fill(""));
      }
    } catch (error) {
      console.error("Failed to generate questions", error);
    } finally {
      setIsGeneratingQs(false);
    }
  };

  const startModule = (selectedMode: "practice" | "test") => {
    setMode(selectedMode);
    setView("active");
    setTestStatus("ready");
    setTimeLeft(3600);
  };

  const finishTest = async () => {
    setTestStatus("finished");
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/reading/submit`, {
        passageId: activeTest._id,
        answers: answers
      }, { withCredentials: true });
      if (res.data.success) setResults(res.data);
    } catch (error) {
      console.error("Failed to submit answers", error);
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const standardTests = passages.filter(p => !p.isAiGenerated);
  const aiTests = passages.filter(p => p.isAiGenerated);

  if (view === "library") {
    return (
      <div className="max-w-7xl mx-auto mt-6 sm:mt-10 space-y-6 sm:space-y-8 animate-in fade-in duration-500 px-4 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Reading Library</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1.5 sm:mt-2">Practice from 1,400+ standard tests or generate a custom AI test.</p>
          </div>
          <Button onClick={generateNewTest} disabled={isGenerating} size="lg" className="w-full sm:w-auto h-12 sm:h-11 bg-primary shadow-lg shadow-primary/20">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
            {isGenerating ? "Writing Essay..." : "Generate AI Test"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full sm:max-w-md grid-cols-2 mb-6 sm:mb-8 h-auto sm:h-12 p-1">
              <TabsTrigger value="standard" className="text-xs sm:text-base py-2.5 sm:py-2">Standard Library ({standardTests.length})</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs sm:text-base py-2.5 sm:py-2">My AI Tests ({aiTests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {standardTests.map((p, index) => (
                  <Card key={p._id} className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50 hover:shadow-sm" onClick={() => selectPassage(p._id)}>
                    <CardHeader className="p-4 sm:p-5">
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <BookText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">Standard</Badge>
                      </div>
                      <CardTitle className="text-sm sm:text-base leading-snug break-words">
                        {p.title === "Reading Practice" ? `Standard Passage #${index + 1}` : p.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              {aiTests.length === 0 ? (
                <div className="text-center py-16 sm:py-20 border border-dashed border-border/50 rounded-xl bg-card/20 px-4">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-3 sm:mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-medium text-foreground">No AI Tests Yet</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Click the generate button above to create your first custom reading passage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {aiTests.map((p) => (
                    <Card key={p._id} className="cursor-pointer hover:border-blue-500/50 transition-colors bg-blue-500/5 hover:shadow-sm" onClick={() => selectPassage(p._id)}>
                      <CardHeader className="p-4 sm:p-5">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                          <BookText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500/70" />
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] sm:text-xs">AI Generated</Badge>
                        </div>
                        <CardTitle className="text-sm sm:text-base leading-snug break-words">{p.title}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  }

  if (view === "menu") {
    return (
      <div className="max-w-4xl mx-auto mt-6 sm:mt-10 space-y-6 sm:space-y-8 animate-in fade-in duration-500 px-4">
        <Button variant="ghost" onClick={() => setView("library")} className="mb-2 sm:mb-4 px-2 sm:px-4 h-9 sm:h-10">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Library
        </Button>
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <Badge variant="outline" className="px-2 py-0.5 sm:px-3 sm:py-1 text-primary border-primary/30 bg-primary/10 text-xs sm:text-sm">Reading Module</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose your session</h1>
          <p className="text-muted-foreground text-sm sm:text-lg px-2">Decide how you want to study today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md" onClick={() => startModule("practice")}>
            <CardHeader className="text-center py-8 sm:py-10"><CardTitle className="text-lg sm:text-xl">Practice Mode (Untimed)</CardTitle></CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 bg-primary/5 transition-all shadow-sm hover:shadow-md" onClick={() => startModule("test")}>
            <CardHeader className="text-center py-8 sm:py-10"><CardTitle className="text-primary text-lg sm:text-xl">Mock Test (60 Min)</CardTitle></CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-3 sm:space-y-4 animate-in fade-in duration-500 min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)] flex flex-col relative px-3 sm:px-4 py-3 sm:py-4 lg:py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shrink-0">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" size="icon" className="shrink-0 mt-0.5 sm:mt-0" onClick={() => setView("library")}><ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="mb-1 text-[10px] sm:text-xs">{activeTest?.isAiGenerated ? "AI Essay" : "Standard Essay"}</Badge>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground line-clamp-2 sm:line-clamp-1 break-words">{activeTest?.title}</h1>
          </div>
        </div>
        {mode === "test" && (
          <div className={`flex items-center justify-center gap-2 text-sm sm:text-xl font-mono font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border shadow-sm w-full sm:w-auto shrink-0 ${timeLeft < 300 ? "text-destructive border-destructive/50 bg-destructive/10 animate-pulse" : "bg-card border-border/50"}`}>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {testStatus === "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm lg:mt-16 border border-border/50 rounded-xl p-4">
          <Card className="max-w-md w-full shadow-2xl bg-card text-center p-6 sm:p-8">
            <CardTitle className="text-2xl sm:text-3xl mb-3 sm:mb-4">Ready to begin?</CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Make sure you are focused and ready to read.</p>
            <Button size="lg" onClick={() => setTestStatus("in-progress")} className="w-full h-12 sm:h-14 text-base sm:text-lg bg-primary">Start {mode === "test" ? "Timer" : "Practice"}</Button>
          </Card>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 lg:min-h-0 transition-opacity duration-500 ${testStatus === "ready" ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        
        {/* Left: Reading Passage (Smooth Scroll) */}
        <Card className="bg-card/40 border-border/50 flex flex-col h-[50vh] lg:h-full lg:w-1/2 overflow-hidden shadow-sm shrink-0 lg:shrink">
          <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
            <h2 className="text-xl sm:text-2xl font-bold font-serif mb-4 sm:mb-6 leading-snug">{activeTest?.title}</h2>
            <div className="prose prose-sm sm:prose-base lg:prose-lg prose-invert max-w-none text-foreground/90 leading-relaxed space-y-4 sm:space-y-6 break-words">
              {activeTest?.passage?.split('\n').map((para: string, i: number) => (
                para.trim() && <p key={i}>{para}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Dynamic Questions Form (Smooth Scroll) */}
        <Card className="bg-card/40 border-border/50 flex flex-col h-[60vh] lg:h-full lg:w-1/2 overflow-hidden shadow-sm shrink-0 lg:shrink">
          <CardHeader className="border-b border-border/40 p-4 sm:p-6 shrink-0 bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div><CardTitle className="text-lg sm:text-xl">Questions</CardTitle></div>
            {testStatus === "finished" && results && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-sm sm:text-lg px-2 sm:px-3 py-0.5 sm:py-1">
                Score: {results.correctAnswers}/{results.totalQuestions}
              </Badge>
            )}
          </CardHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
            
            {/* NO QUESTIONS FALLBACK */}
            {(!activeTest?.questions || activeTest.questions.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded-full flex items-center justify-center">
                  <Wand2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">No Questions Found</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm px-4">This is an older standard passage without pre-saved questions.</p>
                <Button onClick={generateQuestionsForPassage} disabled={isGeneratingQs} className="bg-blue-600 hover:bg-blue-700 mt-2 sm:mt-4 text-xs sm:text-sm h-10 sm:h-11 w-full sm:w-auto px-4">
                  {isGeneratingQs ? <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  {isGeneratingQs ? "Analyzing Text & Writing..." : "Generate AI Questions"}
                </Button>
              </div>
            ) : (
              // NORMAL QUESTIONS RENDER
              <div className="space-y-8 sm:space-y-10 pb-10 lg:pb-0">
                {activeTest?.questions.map((q: any, i: number) => (
                  <div key={i} className="space-y-3 sm:space-y-4 pb-5 sm:pb-6 border-b border-border/40">
                    <Label className="text-sm sm:text-base font-semibold leading-relaxed break-words block">
                      {i + 1}. {q.question}
                      {testStatus === "finished" && results && (
                        <span className={`block sm:inline sm:ml-2 mt-1 sm:mt-0 text-xs sm:text-sm font-bold ${results.results[i].isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                          {results.results[i].isCorrect ? " ✓ Correct" : ` ✗ Incorrect (Answer: ${q.correctAnswer})`}
                        </span>
                      )}
                    </Label>

                    {q.type === "fill_blank" ? (
                      <Input 
                        value={answers[i] || ""} 
                        onChange={(e) => updateAnswer(i, e.target.value)}
                        disabled={testStatus === "finished"}
                        placeholder="Type your answer..." 
                        className="w-full sm:max-w-xs bg-background h-10 sm:h-11 text-sm sm:text-base"
                      />
                    ) : (
                      <RadioGroup 
                        disabled={testStatus === "finished"} 
                        value={answers[i] || ""} 
                        onValueChange={(val) => updateAnswer(i, val)}
                        className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-2"
                      >
                        {(q.type === "true_false_not_given" ? ["TRUE", "FALSE", "NOT GIVEN"] : q.options).map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex items-center space-x-3 bg-muted/20 p-2.5 sm:p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors">
                            <RadioGroupItem value={opt} id={`q${i}-${optIdx}`} className="shrink-0" />
                            <Label htmlFor={`q${i}-${optIdx}`} className="cursor-pointer flex-1 text-xs sm:text-sm leading-snug sm:leading-relaxed break-words">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                ))}

                {testStatus === "in-progress" && (
                  <Button onClick={finishTest} size="lg" className="w-full h-12 sm:h-14 text-sm sm:text-base bg-primary text-primary-foreground shadow-lg">
                    Submit Final Answers
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* CSS For Buttery Smooth Scrolling */}
      <style>{`
        .custom-scrollbar {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        @media (min-width: 640px) { .custom-scrollbar::-webkit-scrollbar { width: 8px; } }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--border)); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: hsl(var(--muted-foreground) / 0.5); }
      `}</style>
    </div>
  );
}