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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reading`, { withCredentials: true });
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/reading/generate`, {}, { withCredentials: true });
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/reading/${id}`, { withCredentials: true });
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/reading/${activeTest._id}/questions`, {}, { withCredentials: true });
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/reading/submit`, {
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
      <div className="max-w-7xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Reading Library</h1>
            <p className="text-muted-foreground mt-2">Practice from 1,400+ standard tests or generate a custom AI test.</p>
          </div>
          <Button onClick={generateNewTest} disabled={isGenerating} size="lg" className="bg-primary shadow-lg shadow-primary/20">
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isGenerating ? "Writing Essay..." : "Generate AI Test"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12">
              <TabsTrigger value="standard" className="text-base">Standard Library ({standardTests.length})</TabsTrigger>
              <TabsTrigger value="ai" className="text-base">My AI Tests ({aiTests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {standardTests.map((p, index) => (
                  <Card key={p._id} className="cursor-pointer hover:border-primary/50 transition-colors bg-card/50" onClick={() => selectPassage(p._id)}>
                    <CardHeader className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <BookText className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="secondary">Standard</Badge>
                      </div>
                      <CardTitle className="text-base leading-snug">
                        {p.title === "Reading Practice" ? `Standard Passage #${index + 1}` : p.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              {aiTests.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border/50 rounded-xl bg-card/20">
                  <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">No AI Tests Yet</h3>
                  <p className="text-muted-foreground">Click the generate button above to create your first custom reading passage.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {aiTests.map((p) => (
                    <Card key={p._id} className="cursor-pointer hover:border-blue-500/50 transition-colors bg-blue-500/5" onClick={() => selectPassage(p._id)}>
                      <CardHeader className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <BookText className="h-5 w-5 text-blue-500/70" />
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">AI Generated</Badge>
                        </div>
                        <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
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
      <div className="max-w-4xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500">
        <Button variant="ghost" onClick={() => setView("library")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Library</Button>
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="px-3 py-1 text-primary border-primary/30 bg-primary/10">Reading Module</Badge>
          <h1 className="text-4xl font-bold tracking-tight">Choose your session</h1>
          <p className="text-muted-foreground text-lg">Decide how you want to study today.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => startModule("practice")}>
            <CardHeader className="text-center py-10"><CardTitle>Practice Mode (Untimed)</CardTitle></CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 bg-primary/5 transition-all" onClick={() => startModule("test")}>
            <CardHeader className="text-center py-10"><CardTitle className="text-primary">Mock Test (60 Min)</CardTitle></CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col relative px-4 pt-4">
      <div className="flex justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setView("library")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <Badge variant="secondary" className="mb-1">{activeTest?.isAiGenerated ? "AI Essay" : "Standard Essay"}</Badge>
            <h1 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{activeTest?.title}</h1>
          </div>
        </div>
        {mode === "test" && (
          <div className={`flex items-center gap-2 text-xl font-mono font-bold px-4 py-2 rounded-lg border shadow-sm ${timeLeft < 300 ? "text-destructive border-destructive/50 bg-destructive/10 animate-pulse" : "bg-card border-border/50"}`}>
            <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {testStatus === "ready" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm mt-16 border border-border/50 rounded-xl">
          <Card className="max-w-md w-full shadow-2xl bg-card text-center p-8">
            <CardTitle className="text-3xl mb-4">Ready to begin?</CardTitle>
            <p className="text-muted-foreground mb-8">Make sure you are focused and ready to read.</p>
            <Button size="lg" onClick={() => setTestStatus("in-progress")} className="w-full h-14 text-lg bg-primary">Start {mode === "test" ? "Timer" : "Practice"}</Button>
          </Card>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0 transition-opacity duration-500 ${testStatus === "ready" ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        
        {/* Left: Reading Passage (Smooth Scroll) */}
        <Card className="bg-card/40 border-border/50 flex flex-col h-full overflow-hidden shadow-sm">
          <CardContent className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            <h2 className="text-2xl font-bold font-serif mb-6">{activeTest?.title}</h2>
            <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed space-y-6 text-lg">
              {activeTest?.passage?.split('\n').map((para: string, i: number) => (
                para.trim() && <p key={i}>{para}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Dynamic Questions Form (Smooth Scroll) */}
        <Card className="bg-card/40 border-border/50 flex flex-col h-full overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/40 pb-4 shrink-0 bg-muted/30 flex flex-row items-center justify-between">
            <div><CardTitle>Questions</CardTitle></div>
            {testStatus === "finished" && results && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-lg px-3 py-1">
                Score: {results.correctAnswers}/{results.totalQuestions}
              </Badge>
            )}
          </CardHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
            
            {/* NO QUESTIONS FALLBACK */}
            {(!activeTest?.questions || activeTest.questions.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                  <Wand2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No Questions Found</h3>
                <p className="text-muted-foreground max-w-sm">This is an older standard passage without pre-saved questions.</p>
                <Button onClick={generateQuestionsForPassage} disabled={isGeneratingQs} className="bg-blue-600 hover:bg-blue-700 mt-4">
                  {isGeneratingQs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isGeneratingQs ? "Analyzing Text & Writing Questions..." : "Generate AI Questions for this Passage"}
                </Button>
              </div>
            ) : (
              // NORMAL QUESTIONS RENDER
              <div className="space-y-10">
                {activeTest?.questions.map((q: any, i: number) => (
                  <div key={i} className="space-y-4 pb-6 border-b border-border/40">
                    <Label className="text-base font-semibold leading-relaxed">
                      {i + 1}. {q.question}
                      {testStatus === "finished" && results && (
                        <span className={`ml-2 text-sm font-bold ${results.results[i].isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
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
                        className="max-w-xs bg-background"
                      />
                    ) : (
                      <RadioGroup 
                        disabled={testStatus === "finished"} 
                        value={answers[i] || ""} 
                        onValueChange={(val) => updateAnswer(i, val)}
                        className="space-y-3 pl-2"
                      >
                        {(q.type === "true_false_not_given" ? ["TRUE", "FALSE", "NOT GIVEN"] : q.options).map((opt: string, optIdx: number) => (
                          <div key={optIdx} className="flex items-center space-x-3 bg-muted/20 p-3 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors">
                            <RadioGroupItem value={opt} id={`q${i}-${optIdx}`} />
                            <Label htmlFor={`q${i}-${optIdx}`} className="cursor-pointer flex-1 text-sm leading-relaxed">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                ))}

                {testStatus === "in-progress" && (
                  <Button onClick={finishTest} size="lg" className="w-full bg-primary text-primary-foreground shadow-lg">
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
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: hsl(var(--border)); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: hsl(var(--muted-foreground) / 0.5); }
      `}</style>
    </div>
  );
}