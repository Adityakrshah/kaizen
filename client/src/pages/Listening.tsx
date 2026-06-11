import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Headphones, CheckCircle2, Loader2, Award, Sparkles, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { request } from "@/shared/api/api";
import { motion, AnimatePresence } from "framer-motion";

export function Listening() {
  const queryClient = useQueryClient();
  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  const { data: testsRes, isLoading: loadingTests } = useQuery({
    queryKey: ["listening-tests"],
    queryFn: () => request("/api/listening"), 
  });

  const generateMutation = useMutation({
    mutationFn: () => request("/api/listening/generate", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listening-tests"] })
  });

  const tests = testsRes?.data || [];

  if (loadingTests) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Audio Library...</p>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (!activeTestId) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Listening Practice</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Train your ear with AI-generated IELTS audio scenarios.</p>
          </div>
          <Button 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            className="w-full md:w-auto bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate New Audio Test
          </Button>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-16 md:py-20 border border-dashed border-border rounded-xl bg-card/10 px-4">
            <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">No Tests Available</h3>
            <p className="text-muted-foreground text-sm md:text-base">Click the generate button above to create your first listening test.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tests.map((test: any) => (
              <Card 
                key={test._id} 
                className="group cursor-pointer hover:border-primary/50 transition-all bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md" 
                onClick={() => setActiveTestId(test._id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">{test.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{test.title}</CardTitle>
                  <CardDescription className="text-sm">{test.questions?.length || 0} Questions</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- ACTIVE TEST VIEW ---
  return <ActiveTest testId={activeTestId} onBack={() => setActiveTestId(null)} />;
}

// --- SUB-COMPONENT: ACTIVE TEST WITH "PARTS" LOGIC ---
function ActiveTest({ testId, onBack }: { testId: string, onBack: () => void }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const [currentPart, setCurrentPart] = useState(0);
  const QUESTIONS_PER_PART = 2; 

  const { data: testRes, isLoading } = useQuery({
    queryKey: ["listening-test", testId],
    queryFn: () => request(`/api/listening/${testId}`),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => request("/api/listening/submit", {
      method: "POST",
      body: payload
    }),
    onSuccess: (res) => setResult(res.data || res) 
  });

  const test = testRes?.data;

  if (isLoading || !test) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const totalQuestions = test.questions.length;
  const totalParts = Math.ceil(totalQuestions / QUESTIONS_PER_PART);
  
  const currentQuestions = test.questions.slice(
    currentPart * QUESTIONS_PER_PART, 
    (currentPart + 1) * QUESTIONS_PER_PART
  );

  const handleOptionSelect = (globalIndex: number, option: string) => {
    const newAnswers = [...answers];
    newAnswers[globalIndex] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    submitMutation.mutate({ listeningId: testId, answers });
  };

  // --- RESULTS VIEW ---
  if (result) {
    const scorePercentage = (result.correctAnswers / result.totalQuestions) * 100;
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 pb-12">
        <Button variant="ghost" onClick={onBack} className="pl-0 hover:bg-transparent hover:underline text-sm md:text-base">
          ← Back to Library
        </Button>
        <Card className="bg-card/40 border-primary/20 backdrop-blur-sm text-center py-8 md:py-10">
          <Award className={`h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 ${scorePercentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Score: {result.correctAnswers} / {result.totalQuestions}</h2>
          <p className="text-muted-foreground text-sm md:text-lg">Your listening evaluation is complete.</p>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold px-1">Detailed Breakdown</h3>
          {result.results.map((res: any, idx: number) => (
            <Card key={idx} className={`border-l-4 ${res.isCorrect ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-destructive bg-destructive/5'}`}>
              <CardContent className="pt-4 md:pt-6">
                <p className="font-medium mb-4 text-sm md:text-base"><span className="opacity-50 mr-2">Q{idx + 1}.</span> {res.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground shrink-0">Your Answer:</span>
                    {res.isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                    <span className={`font-semibold truncate ${res.isCorrect ? 'text-emerald-500' : 'text-destructive'}`}>{res.yourAnswer || "No answer"}</span>
                  </div>
                  {!res.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground shrink-0">Correct:</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-emerald-500 truncate">{res.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- TAKING THE TEST (CHUNKED) ---
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 pb-24 md:pb-20 animate-in fade-in">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} size="sm" className="pl-0 hover:bg-transparent hover:underline">
          ← <span className="hidden sm:inline ml-1">Cancel Test</span>
        </Button>
        <Badge variant="outline" className="text-primary border-primary/50 text-xs md:text-sm py-1">
          Part {currentPart + 1} of {totalParts}
        </Badge>
      </div>

      {/* Sticky Audio Player */}
      <Card className="bg-card/80 border-primary/20 backdrop-blur-xl sticky top-2 md:top-4 z-50 shadow-xl shadow-background/20">
        <CardContent className="p-4 md:pt-6 md:pb-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="hidden md:flex h-14 w-14 rounded-full bg-primary/10 items-center justify-center shrink-0">
            <Headphones className="text-primary h-6 w-6 animate-pulse" />
          </div>
          <div className="flex-1 w-full space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 md:gap-2">
                <h2 className="text-base md:text-xl font-bold line-clamp-1">{test.title}</h2>
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">Listen to audio</span>
            </div>
            
            <audio 
              key={test.audioUrl} 
              controls 
              className="w-full h-10 accent-primary focus:outline-none"
            >
              <source 
                src={`${import.meta.env.VITE_API_URL || ""}${test.audioUrl.replace(/https?:\/\/[^\/]+/, "")}`} 
                type="audio/mpeg" 
              />
            </audio>
            
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPart}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 md:space-y-6"
        >
          {currentQuestions.map((q: any, localIdx: number) => {
            const globalIdx = (currentPart * QUESTIONS_PER_PART) + localIdx;
            
            return (
              <Card key={globalIdx} className="bg-card/40 border-border/50 shadow-sm">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg leading-relaxed">
                    <span className="text-primary mr-2 font-black">Q{globalIdx + 1}.</span> {q.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {q.options.map((opt: string) => (
                    <Button
                      key={opt}
                      variant={answers[globalIdx] === opt ? "default" : "outline"}
                      className={`justify-start h-auto py-3 md:py-4 px-4 md:px-5 text-left whitespace-normal text-sm md:text-base transition-all ${answers[globalIdx] === opt ? 'shadow-md ring-1 ring-primary/50' : 'hover:bg-primary/5'}`}
                      onClick={() => handleOptionSelect(globalIdx, opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="pt-4 md:pt-6 border-t border-border/50">
        {currentPart < totalParts - 1 ? (
          <Button 
            size="lg" 
            variant="secondary"
            className="w-full h-14 md:h-16 text-base md:text-lg font-bold" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentPart(prev => prev + 1);
            }}
          >
            Continue to Part {currentPart + 2} <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
        ) : (
          <Button 
            size="lg" 
            className="w-full h-14 md:h-16 text-base md:text-lg font-bold shadow-xl shadow-primary/20" 
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Submit Final Answers"}
          </Button>
        )}
      </div>
    </div>
  );
}