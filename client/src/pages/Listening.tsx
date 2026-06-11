import { useState, useRef } from "react";
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Listening Practice</h1>
            <p className="text-muted-foreground mt-1">Train your ear with AI-generated IELTS audio scenarios.</p>
          </div>
          <Button 
            onClick={() => generateMutation.mutate()} 
            disabled={generateMutation.isPending}
            className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate New Audio Test
          </Button>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/10">
            <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">No Tests Available</h3>
            <p className="text-muted-foreground">Click the generate button above to create your first listening test.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Badge variant="outline" className="capitalize">{test.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{test.title}</CardTitle>
                  <CardDescription>{test.questions?.length || 0} Questions</CardDescription>
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
  
  // NEW: State for chunking the test into parts
  const [currentPart, setCurrentPart] = useState(0);
  const QUESTIONS_PER_PART = 2; // Show 2 questions per section

  const { data: testRes, isLoading } = useQuery({
    queryKey: ["listening-test", testId],
    queryFn: () => request(`/api/listening/${testId}`),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => request("/api/listening/submit", {
      method: "POST",
      body: payload
    }),
    onSuccess: (res) => setResult(res.data || res) // Handle both {data: ...} and direct objects
  });

  const test = testRes?.data;

  if (isLoading || !test) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  // Math for parts
  const totalQuestions = test.questions.length;
  const totalParts = Math.ceil(totalQuestions / QUESTIONS_PER_PART);
  
  // Get only the questions for the current part
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
      <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 pb-12">
        <Button variant="ghost" onClick={onBack}>← Back to Library</Button>
        <Card className="bg-card/40 border-primary/20 backdrop-blur-sm text-center py-10">
          <Award className={`h-20 w-20 mx-auto mb-4 ${scorePercentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
          <h2 className="text-4xl font-black tracking-tight mb-2">Score: {result.correctAnswers} / {result.totalQuestions}</h2>
          <p className="text-muted-foreground text-lg">Your listening evaluation is complete.</p>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold px-1">Detailed Breakdown</h3>
          {result.results.map((res: any, idx: number) => (
            <Card key={idx} className={`border-l-4 ${res.isCorrect ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-destructive bg-destructive/5'}`}>
              <CardContent className="pt-6">
                <p className="font-medium mb-4"><span className="opacity-50 mr-2">Q{idx + 1}.</span> {res.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Your Answer:</span>
                    {res.isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    <span className={`font-semibold ${res.isCorrect ? 'text-emerald-500' : 'text-destructive'}`}>{res.yourAnswer || "No answer"}</span>
                  </div>
                  {!res.isCorrect && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Correct Answer:</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-500">{res.correctAnswer}</span>
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>← Cancel Test</Button>
        <Badge variant="outline" className="text-primary border-primary/50">
          Part {currentPart + 1} of {totalParts}
        </Badge>
      </div>

      {/* Sticky Audio Player */}
      <Card className="bg-card/80 border-primary/20 backdrop-blur-xl sticky top-4 z-50 shadow-xl shadow-background/20">
        <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-6">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Headphones className="text-primary h-6 w-6 animate-pulse" />
          </div>
          <div className="flex-1 w-full space-y-2">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold line-clamp-1">{test.title}</h2>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Listen to the audio</span>
            </div>
            <audio controls className="w-full h-10 accent-primary focus:outline-none">
              <source 
                src={`${import.meta.env.VITE_API_URL || ""}${test.audioUrl.replace(/https?:\/\/[^\/]+/, "")}`} 
                type="audio/mpeg" 
              />
            </audio>
          </div>
        </CardContent>
      </Card>

      {/* Questions List (Only shows the current chunk) */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPart}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {currentQuestions.map((q: any, localIdx: number) => {
            // Calculate the actual index in the main array
            const globalIdx = (currentPart * QUESTIONS_PER_PART) + localIdx;
            
            return (
              <Card key={globalIdx} className="bg-card/40 border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg leading-relaxed">
                    <span className="text-primary mr-2 font-black">Q{globalIdx + 1}.</span> {q.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt: string) => (
                    <Button
                      key={opt}
                      variant={answers[globalIdx] === opt ? "default" : "outline"}
                      className={`justify-start h-auto py-4 px-5 text-left whitespace-normal ${answers[globalIdx] === opt ? 'shadow-md ring-1 ring-primary/50' : 'hover:bg-primary/5'}`}
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

      {/* Controls: Next Part OR Submit */}
      <div className="pt-6 border-t border-border/50">
        {currentPart < totalParts - 1 ? (
          <Button 
            size="lg" 
            variant="secondary"
            className="w-full h-16 text-lg font-bold" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentPart(prev => prev + 1);
            }}
          >
            Continue to Part {currentPart + 2} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20" 
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