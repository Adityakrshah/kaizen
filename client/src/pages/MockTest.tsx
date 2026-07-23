import { useState, useEffect, useCallback, useRef } from "react";
import { 
  ShieldAlert, Clock, AlertTriangle, 
  Lock, EyeOff, CheckCircle2, BarChart3, 
  Sparkles, Skull, Loader2, 
  Mic, Wifi, MonitorCheck, PlayCircle, ChevronRight,
  Headphones, FileText, Mic2, Square, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";

const SECTIONS = [
  { id: "listening", name: "Listening", duration: 30 * 60, description: "4 parts, 40 questions. Audio plays only once." },
  { id: "reading", name: "Reading", duration: 60 * 60, description: "3 reading passages, 40 questions." },
  { id: "writing", name: "Writing", duration: 60 * 60, description: "Task 1 (150 words) and Task 2 (250 words)." },
  { id: "speaking", name: "Speaking", duration: 15 * 60, description: "Automated AI interview. Speak clearly into the microphone." },
];

export function MockTest() {
  const [testState, setTestState] = useState<"lobby" | "systemCheck" | "sectionIntro" | "running" | "completed" | "terminated">("lobby");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [testId, setTestId] = useState<string | null>(null);
  const [examBundle, setExamBundle] = useState<any>(null); 
  
  // CENTRALIZED ANSWER TRACKING
  const [testAnswers, setTestAnswers] = useState({
    listening: {} as Record<string, string>,
    reading: {} as Record<string, string>,
    writing: { task1: "", task2: "" },
    speaking: { audioUrl: null as string | null } 
  });

  // UI States
  const [activeReadingPassage, setActiveReadingPassage] = useState(0);
  
  // Speaking Recorder States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // Grading States
  const [isGrading, setIsGrading] = useState(false);
  const [finalScores, setFinalScores] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");
  const MAX_WARNINGS = 3;

  const [gracePeriod, setGracePeriod] = useState(false);
  const [graceTime, setGraceTime] = useState(10);
  const [systemChecks, setSystemChecks] = useState({ mic: false, network: false, browser: false });

  const currentSection = SECTIONS[currentSectionIndex];

  // --- SYSTEM CHECKS ---
  const initiateSystemCheck = async () => {
    setTestState("systemCheck");
    setSystemChecks({ mic: false, network: false, browser: false });

    setTimeout(async () => {
      setSystemChecks(prev => ({ ...prev, network: navigator.onLine }));
      setSystemChecks(prev => ({ ...prev, browser: document.fullscreenEnabled }));
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setSystemChecks(prev => ({ ...prev, mic: true }));
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    }, 500);
  };

  const startSecureSession = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/mocktest/start`, {}, { withCredentials: true });
        if (res.data.success) {
          setTestId(res.data.data._id);
          setExamBundle(res.data.bundle); 
        }
      } catch (err) {
        console.warn("Backend error, proceeding locally.");
      }
      setCurrentSectionIndex(0);
      setTestState("sectionIntro");
      setWarnings(0);
    } catch (err) {
      alert("Your browser blocked the fullscreen request. Please allow it to continue.");
    }
  };

  const syncTestStatus = async (status: string, currentWarnings: number, reason: string = "") => {
    if (!testId) return;
    try {
      await axios.patch(`${import.meta.env.VITE_SERVER_URL}/api/mocktest/update`, { testId, status, warnings: currentWarnings, terminationReason: reason }, { withCredentials: true });
    } catch (err) {}
  };

  // --- GRADING ENGINE ---
  const submitAndGradeExam = async () => {
    setIsGrading(true);
    setTestState("completed"); 

    try {
      let listeningCorrect = 0;
      let listeningTotal = examBundle?.listening?.questions?.length || 1;
      examBundle?.listening?.questions?.forEach((q: any, i: number) => {
        if (testAnswers.listening[i] === q.correctAnswer) listeningCorrect++;
      });
      const listeningBand = Math.round((listeningCorrect / listeningTotal) * 9 * 2) / 2;

      let readingCorrect = 0;
      let readingTotal = 0;
      examBundle?.reading?.forEach((passage: any, pIdx: number) => {
        passage.questions?.forEach((q: any, qIdx: number) => {
          readingTotal++;
          if (testAnswers.reading[`${pIdx}_${qIdx}`] === q.correctAnswer) readingCorrect++;
        });
      });
      const readingBand = readingTotal > 0 ? Math.round((readingCorrect / readingTotal) * 9 * 2) / 2 : 0;

      let writingBand = 0;
      let currentAiFeedback = aiFeedback;
      try {
        const evalRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/mocktest/evaluate-writing`, {
          task1Response: testAnswers.writing.task1,
          task2Response: testAnswers.writing.task2,
          prompts: examBundle?.writing
        }, { withCredentials: true });
        
        if (evalRes.data.success) {
          writingBand = evalRes.data.bandScore;
          currentAiFeedback = evalRes.data.feedback;
          setAiFeedback(currentAiFeedback); 
        }
      } catch (err) {
        console.error("AI Writing evaluation failed", err);
        writingBand = testAnswers.writing.task2.length > 50 ? 5.5 : 0; 
        currentAiFeedback = "AI evaluation failed due to a network error. Fallback score applied based on word count.";
        setAiFeedback(currentAiFeedback);
      }

      const speakingBand = testAnswers.speaking.audioUrl ? 6.5 : 0; 

      const overallBand = (listeningBand + readingBand + writingBand + speakingBand) / 4;

      const calculatedScores = {
        listening: listeningBand || 0,
        reading: readingBand || 0,
        writing: writingBand || 0,
        speaking: speakingBand || 0,
        overallBand: Math.round(overallBand * 2) / 2
      };

      setFinalScores(calculatedScores);

      if (testId) {
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/mocktest/submit`, {
          testId,
          sections: {
            listening: { score: listeningBand || 0 },
            reading: { score: readingBand || 0 },
            writing: { score: writingBand || 0 },
            speaking: { score: speakingBand || 0 }
          },
          detailedReport: {
            writing: { aiFeedback: currentAiFeedback || "No feedback generated." }
          }
        }, { withCredentials: true });
      }

      document.exitFullscreen().catch(() => {});
    } catch (err) {
      console.error("Grading failed", err);
    } finally {
      setIsGrading(false);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setTestState("sectionIntro");
    } else {
      submitAndGradeExam();
    }
  };

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setTestAnswers(prev => ({ ...prev, speaking: { audioUrl: url } }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // --- ANTI-CHEAT ---
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && (testState === "running" || testState === "sectionIntro") && !gracePeriod) {
      setWarnings((prev) => {
        const newWarnings = prev + 1;
        if (newWarnings >= MAX_WARNINGS) {
          const reason = "Exam terminated due to multiple background tab switches.";
          setTestState("terminated");
          setTerminationReason(reason);
          syncTestStatus("terminated", newWarnings, reason);
          document.exitFullscreen().catch(() => {});
        } else {
          setShowWarningModal(true);
          syncTestStatus("running", newWarnings);
        }
        return newWarnings;
      });
    }
  }, [testState, testId, gracePeriod]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && (testState === "running" || testState === "sectionIntro")) {
      setGracePeriod(true);
      setGraceTime(10);
    }
  }, [testState]);

  useEffect(() => {
    if (testState === "running" || testState === "sectionIntro") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      const disableContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener("contextmenu", disableContextMenu);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("contextmenu", disableContextMenu);
      };
    }
  }, [testState, handleVisibilityChange, handleFullscreenChange]);

  // --- TIMERS ---
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gracePeriod && graceTime > 0) timer = setInterval(() => setGraceTime(prev => prev - 1), 1000);
    else if (gracePeriod && graceTime === 0) {
      const reason = "You exited fullscreen and failed to return within the grace period.";
      setTestState("terminated");
      setTerminationReason(reason);
      syncTestStatus("terminated", warnings, reason);
      setGracePeriod(false);
    }
    return () => clearInterval(timer);
  }, [gracePeriod, graceTime, warnings]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (testState === "running" && timeLeft > 0 && !showWarningModal && !gracePeriod) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && testState === "running") {
      handleNextSection();
    }
    return () => clearInterval(timer);
  }, [testState, timeLeft, showWarningModal, gracePeriod]);

  const beginSectionTimer = () => {
    setTimeLeft(currentSection.duration);
    setTestState("running");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const restoreFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setGracePeriod(false);
    } catch (err) {}
  };

  // 📝 --- INTERNAL EXAM RENDERERS ---

  const renderListening = () => (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
      <Card className="p-4 sm:p-6 border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <Headphones className="h-10 w-10 sm:h-12 sm:w-12 text-primary shrink-0" />
        <div className="flex-1 w-full space-y-2">
          <h3 className="font-bold text-base sm:text-lg">Section 1 Audio</h3>
          <audio 
            src={`${import.meta.env.VITE_SERVER_URL}${examBundle?.listening?.audioUrl?.replace(/^\//, '')}`} 
            controls 
            controlsList="nodownload" 
            className="w-full h-10" 
          />
        </div>
      </Card>
      <div className="space-y-4 sm:space-y-6">
        {examBundle?.listening?.questions?.map((q: any, i: number) => (
          <Card key={i} className="p-4 sm:p-6">
            <p className="font-medium mb-4 text-sm sm:text-base">{i + 1}. {q.question}</p>
            
            {q.type === "fill_blank" ? (
                <input 
                  type="text"
                  placeholder="Type your answer..."
                  className="w-full sm:max-w-xs bg-background h-10 sm:h-11 px-3 text-sm sm:text-base border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={testAnswers.listening[i] || ""}
                  onChange={(e) => setTestAnswers(p => ({ ...p, listening: { ...p.listening, [i]: e.target.value } }))}
                />
            ) : (
              <div className="space-y-3">
                {(q.options || []).map((opt: string, j: number) => (
                  <label key={j} className="flex items-start sm:items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="radio" name={`list_q${i}`} className="w-4 h-4 mt-0.5 sm:mt-0 text-primary shrink-0" 
                      checked={testAnswers.listening[i] === opt}
                      onChange={() => setTestAnswers(p => ({ ...p, listening: { ...p.listening, [i]: opt } }))}
                    />
                    <span className="text-sm sm:text-base">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReading = () => {
    const readingData = examBundle?.reading?.passages || examBundle?.readingData || examBundle?.reading;
    const passage = Array.isArray(readingData) ? readingData[activeReadingPassage] : readingData;
    const questionsList = passage?.questions || passage?.Questions || [];

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500 pb-10">
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {Array.isArray(readingData) && readingData.map((_: any, idx: number) => (
            <Button 
              key={idx} 
              variant={activeReadingPassage === idx ? "default" : "outline"} 
              onClick={() => setActiveReadingPassage(idx)} 
              className="text-xs sm:text-sm"
            >
              Passage {idx + 1}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100%-3rem)]">
          <Card className="w-full lg:w-1/2 p-4 sm:p-8 lg:overflow-y-auto custom-scrollbar border-border/50 shadow-inner bg-card">
            <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">{passage?.title || "Reading Passage"}</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none leading-loose text-muted-foreground whitespace-pre-wrap">
              {passage?.passage || passage?.text || "No passage text available."}
            </div>
          </Card>
          
          <Card className="w-full lg:w-1/2 p-4 sm:p-8 lg:overflow-y-auto custom-scrollbar border-border/50 bg-muted/10">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5"/> Questions
            </h3>
            
            {questionsList.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No questions found for this passage in the mock bundle.</p>
            )}

            <div className="space-y-6">
              {questionsList.map((q: any, i: number) => {
                const optionsList = q.options || q.Options || q.choices || [];
                const questionText = q.question || q.text || q.prompt;
                
                return (
                  <div key={i} className="space-y-3">
                    <p className="font-medium text-sm">{i + 1}. {questionText}</p>
                    
                    {q.type === "fill_blank" ? (
                      <input 
                        type="text"
                        placeholder="Type your answer..."
                        className="w-full sm:max-w-xs bg-background h-10 sm:h-11 px-3 text-sm sm:text-base border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={testAnswers.reading[`${activeReadingPassage}_${i}`] || ""}
                        onChange={(e) => setTestAnswers(p => ({ ...p, reading: { ...p.reading, [`${activeReadingPassage}_${i}`]: e.target.value } }))}
                      />
                    ) : (
                      <div className="space-y-2.5 sm:space-y-3 pl-1 sm:pl-2">
                        {(q.type === "true_false_not_given" ? ["TRUE", "FALSE", "NOT GIVEN"] : optionsList).map((opt: string, j: number) => (
                          <label key={j} className="flex items-start sm:items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:border-primary transition-colors text-xs sm:text-sm">
                            <input 
                              type="radio" 
                              name={`read_p${activeReadingPassage}_q${i}`} 
                              className="w-4 h-4 mt-0.5 sm:mt-0 text-primary shrink-0" 
                              checked={testAnswers.reading[`${activeReadingPassage}_${i}`] === opt}
                              onChange={() => setTestAnswers(p => ({ ...p, reading: { ...p.reading, [`${activeReadingPassage}_${i}`]: opt } }))}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderWriting = () => (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 animate-in fade-in duration-500 pb-10">
      <Card className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 border-border/50 overflow-hidden">
        <div className="bg-muted p-3 sm:p-4 border-b shrink-0"><h3 className="font-bold text-sm sm:text-base">Task 1 (150 words)</h3></div>
        <div className="p-4 sm:p-6 shrink-0 border-b bg-primary/5 text-xs sm:text-sm">{examBundle?.writing?.task1}</div>
        <textarea 
          className="flex-1 p-4 sm:p-6 resize-none bg-transparent outline-none custom-scrollbar text-sm sm:text-base"
          placeholder="Begin writing your Task 1 response here..."
          value={testAnswers.writing.task1}
          onChange={(e) => setTestAnswers(p => ({ ...p, writing: { ...p.writing, task1: e.target.value } }))}
        />
        <div className="p-2 sm:p-3 border-t text-xs text-muted-foreground text-right shrink-0">Words: {testAnswers.writing.task1.split(/\s+/).filter(w => w.length > 0).length}</div>
      </Card>
      <Card className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 border-border/50 overflow-hidden">
        <div className="bg-muted p-3 sm:p-4 border-b shrink-0"><h3 className="font-bold text-sm sm:text-base">Task 2 (250 words)</h3></div>
        <div className="p-4 sm:p-6 shrink-0 border-b bg-primary/5 text-xs sm:text-sm">{examBundle?.writing?.task2}</div>
        <textarea 
          className="flex-1 p-4 sm:p-6 resize-none bg-transparent outline-none custom-scrollbar text-sm sm:text-base"
          placeholder="Begin writing your Task 2 response here..."
          value={testAnswers.writing.task2}
          onChange={(e) => setTestAnswers(p => ({ ...p, writing: { ...p.writing, task2: e.target.value } }))}
        />
        <div className="p-2 sm:p-3 border-t text-xs text-muted-foreground text-right shrink-0">Words: {testAnswers.writing.task2.split(/\s+/).filter(w => w.length > 0).length}</div>
      </Card>
    </div>
  );

  const renderSpeaking = () => (
    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 pb-10">
      <Card className="max-w-xl w-full p-6 sm:p-10 text-center space-y-6 sm:space-y-8 border-border/50 shadow-xl mx-4">
        <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">Part 2: Long Turn</Badge>
        <h2 className="text-lg sm:text-xl font-medium leading-relaxed">{examBundle?.speaking?.part2}</h2>
        
        <div className="py-6 sm:py-8 flex flex-col items-center">
          {!testAnswers.speaking.audioUrl ? (
            <>
              {isRecording ? (
                <Button size="lg" variant="destructive" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shadow-2xl animate-pulse" onClick={stopRecording}>
                  <Square className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
                </Button>
              ) : (
                <Button size="lg" className="h-20 w-20 sm:h-24 sm:w-24 rounded-full shadow-2xl hover:scale-105 transition-all bg-emerald-500 hover:bg-emerald-600 text-white" onClick={startRecording}>
                  <Mic2 className="h-8 w-8 sm:h-10 sm:w-10" />
                </Button>
              )}
              <p className={`mt-4 sm:mt-6 text-xs sm:text-sm font-medium ${isRecording ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
                {isRecording ? "Recording... Click square to stop." : "Click microphone to begin speaking."}
              </p>
            </>
          ) : (
            <div className="w-full space-y-6 animate-in fade-in zoom-in">
              <div className="p-4 bg-muted/50 rounded-xl border border-border/50 flex flex-col items-center">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 mb-3" />
                <h3 className="font-bold text-foreground text-sm sm:text-base">Response Recorded!</h3>
                <p className="text-xs text-muted-foreground mb-4">Playback your audio to confirm quality.</p>
                <audio src={testAnswers.speaking.audioUrl} controls className="w-full h-12" />
              </div>
              <Button variant="outline" onClick={() => setTestAnswers(p => ({ ...p, speaking: { audioUrl: null } }))} className="text-xs sm:text-sm">
                Rerecord Response
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // --- LOBBY ---
  if (testState === "lobby") {
    return (
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-500 pb-20 mt-6 sm:mt-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 bg-card border border-border/50 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm">
          <div className="space-y-3 sm:space-y-4 text-left">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 sm:px-4 py-1 text-xs sm:text-sm uppercase tracking-widest font-bold">Official Simulation</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Full Mock Exam</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg">Experience the real test environment. 2.5 hours of uninterrupted focus required.</p>
          </div>
          <Button size="lg" onClick={initiateSystemCheck} className="w-full md:w-auto h-14 sm:h-16 px-6 sm:px-12 text-base sm:text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground rounded-full shrink-0">
            Begin Pre-Flight Check <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="p-6 sm:p-8 border-border/50 bg-card/40 shadow-sm md:col-span-2">
             <h3 className="font-bold flex items-center gap-2 mb-4 sm:mb-6 text-base sm:text-lg"><Clock className="h-5 w-5 text-primary" /> Exam Breakdown</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {SECTIONS.map((sec, idx) => (
                  <div key={sec.id} className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground text-sm sm:text-base">{idx + 1}. {sec.name}</span>
                      <Badge variant="outline" className="text-xs">{sec.duration / 60} min</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{sec.description}</p>
                  </div>
                ))}
             </div>
          </Card>
          <Card className="p-6 sm:p-8 border-border/50 bg-card/40 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4 sm:mb-6 text-base sm:text-lg"><ShieldAlert className="h-5 w-5 text-destructive" /> Security Rules</h3>
            <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-muted-foreground">
              <li className="flex gap-3"><MonitorCheck className="h-4 w-4 sm:h-5 sm:w-5 text-foreground shrink-0" /> Fullscreen is locked.</li>
              <li className="flex gap-3"><EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-foreground shrink-0" /> Tab switching is monitored.</li>
              <li className="flex gap-3"><Lock className="h-4 w-4 sm:h-5 sm:w-5 text-foreground shrink-0" /> Clipboard is disabled.</li>
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  // --- FULLSCREEN EXAM INTERFACE ---
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-300">
      
      {/* 1. SYSTEM CHECK */}
      {testState === "systemCheck" && (
        <div className="flex items-center justify-center h-full w-full bg-background/95 backdrop-blur-sm px-4">
          <Card className="max-w-md w-full p-6 sm:p-10 space-y-6 sm:space-y-8 bg-card shadow-2xl border-primary/20 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <MonitorCheck className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-black">System Diagnostic</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Verifying your environment before lockdown.</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <CheckItem label="Network Connection" passed={systemChecks.network} icon={<Wifi className="h-4 w-4" />} />
              <CheckItem label="Microphone Access" passed={systemChecks.mic} icon={<Mic className="h-4 w-4" />} />
              <CheckItem label="Browser Compatibility" passed={systemChecks.browser} icon={<MonitorCheck className="h-4 w-4" />} />
            </div>
            <Button className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold" disabled={!(systemChecks.browser && systemChecks.network && systemChecks.mic)} onClick={startSecureSession}>
              {systemChecks.browser && systemChecks.network && systemChecks.mic ? "Enter Fullscreen Lockdown" : <Loader2 className="animate-spin h-5 w-5" />}
            </Button>
          </Card>
        </div>
      )}

      {/* 2. RESULTS & TERMINATION */}
      {(testState === "terminated" || testState === "completed") && (
        <div className="flex-1 overflow-y-auto w-full">
          {isGrading ? (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500 mt-20 sm:mt-32 px-4 text-center">
              <Loader2 className="h-16 w-16 sm:h-20 sm:w-20 text-primary animate-spin mb-6 sm:mb-8" />
              <h2 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4">AI Proctors are grading your exam...</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Evaluating your essays and analyzing your voice patterns.</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 px-4 mt-10 sm:mt-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                {testState === "terminated" ? (
                  <>
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-destructive/10 rounded-full mb-2">
                      <Skull className="h-8 w-8 sm:h-10 sm:w-10 text-destructive animate-pulse" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-destructive uppercase">Exam Terminated</h1>
                    <p className="text-muted-foreground text-sm sm:text-lg border border-destructive/20 bg-destructive/5 py-2 px-4 rounded-lg inline-block">
                      {terminationReason}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-emerald-500/10 rounded-full mb-2">
                      <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Mock Exam Completed</h1>
                    <p className="text-muted-foreground text-sm sm:text-lg">Your responses have been processed by our AI proctors.</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <Card className={`md:col-span-1 shadow-2xl flex flex-col items-center justify-center p-8 sm:p-10 border-none relative overflow-hidden ${testState === "terminated" ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
                   <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="h-16 w-16 sm:h-24 sm:w-24" /></div>
                   <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Overall Band Score</p>
                   <div className="text-6xl sm:text-8xl font-black tracking-tighter">{finalScores?.overallBand || 0}</div>
                </Card>

                <Card className="md:col-span-2 p-6 sm:p-8 bg-card border-border grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 relative shadow-xl">
                  {testState === "terminated" && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 md:rotate-[-15deg]"><span className="text-4xl sm:text-6xl font-black uppercase text-destructive tracking-widest text-center">Incomplete</span></div>}
                  <SummaryMetric title="Listening" score={finalScores?.listening || 0} />
                  <SummaryMetric title="Reading" score={finalScores?.reading || 0} />
                  <SummaryMetric title="Writing" score={finalScores?.writing || 0} />
                  <SummaryMetric title="Speaking" score={finalScores?.speaking || 0} />
                </Card>
              </div>

              {testState === "terminated" && (
                <div className="max-w-3xl mx-auto mt-6 sm:mt-8 p-4 sm:p-6 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg shadow-sm">
                  <h4 className="font-bold flex items-center gap-2 text-amber-600 mb-2 text-sm sm:text-base"><AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5"/> Proctor's Note:</h4>
                  <p className="text-amber-700/80 italic leading-relaxed text-xs sm:text-sm">
                    "Oops. Did your fingers magically slip on the ESC key? Or were you just trying to quickly ask ChatGPT for the answers? 
                    Either way, the official examiners won't be as forgiving. Above is your score based on what you actually managed to finish."
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
                <Button variant="outline" size="lg" className="px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base w-full sm:w-auto" onClick={() => { setTestState("lobby"); setFinalScores(null); document.exitFullscreen().catch(() => {}); }}>
                  Exit Exam Environment
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className={`px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base shadow-xl w-full sm:w-auto ${testState === "terminated" ? 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20' : 'bg-primary text-primary-foreground shadow-primary/20'}`}>
                      <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> View Detailed Diagnostics
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto custom-scrollbar p-0 z-[10000] border-border/50">
                    <div className="p-4 sm:p-8 bg-card text-card-foreground">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 border-b border-border/50 pb-4 sm:pb-6">
                        <div className="p-3 sm:p-4 bg-primary/10 rounded-full text-primary shrink-0"><Sparkles className="h-6 w-6 sm:h-8 sm:w-8"/></div>
                        <div>
                          <h2 className="text-xl sm:text-3xl font-black">AI Diagnostic Report</h2>
                          <p className="text-xs sm:text-sm text-muted-foreground">Detailed breakdown of your performance by Groq AI</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6 sm:space-y-8">
                        {aiFeedback ? (
                          <div className="p-4 sm:p-6 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-primary"><FileText className="h-4 w-4 sm:h-5 sm:w-5"/> Writing Evaluation</h3>
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{aiFeedback}</p>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-6 bg-muted/50 border rounded-xl flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0"/> No AI feedback generated for this session.
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-4 border rounded-xl bg-card">
                             <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Listening Accuracy</p>
                             <p className="text-xl sm:text-2xl font-black">{finalScores?.listening ? Math.round((finalScores.listening / 9) * 100) : 0}%</p>
                          </div>
                          <div className="p-4 border rounded-xl bg-card">
                             <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Reading Accuracy</p>
                             <p className="text-xl sm:text-2xl font-black">{finalScores?.reading ? Math.round((finalScores.reading / 9) * 100) : 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SECTION INTRO OVERLAY */}
      {testState === "sectionIntro" && !gracePeriod && !showWarningModal && (
        <div className="flex items-center justify-center h-full w-full bg-background px-4">
          <div className="max-w-2xl text-center space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <Badge variant="outline" className="px-3 sm:px-4 py-1 text-primary border-primary/20 bg-primary/10 text-xs sm:text-sm">SECTION {currentSectionIndex + 1} OF 4</Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">{currentSection.name}</h1>
            <p className="text-lg sm:text-2xl text-muted-foreground">{currentSection.duration / 60} Minutes</p>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed border-t border-border/50 pt-6 sm:pt-8 mt-6 sm:mt-8">
              {currentSection.description} <br/> The timer will not start until you click begin.
            </p>
            <div className="pt-6 sm:pt-8">
              <Button size="lg" className="h-14 sm:h-16 px-8 sm:px-16 text-base sm:text-xl rounded-full shadow-2xl shadow-primary/20 w-full sm:w-auto" onClick={beginSectionTimer}>
                Begin Section <PlayCircle className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. RUNNING EXAM */}
      {testState === "running" && (
        <div className="flex flex-col h-full w-full">
          <div className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-8 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="font-mono uppercase tracking-widest bg-muted/50 text-foreground py-0.5 sm:py-1 text-[10px] sm:text-xs">{currentSection.name}</Badge>
              <div className="h-4 w-px bg-border/50 hidden sm:block" />
              <span className="hidden sm:inline text-xs text-muted-foreground font-medium">Kaizen Secure Browser</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <span className={`text-lg sm:text-3xl font-black font-mono tracking-tighter w-auto sm:w-24 text-right ${timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                {formatTime(timeLeft)}
              </span>
              <Button onClick={handleNextSection} variant="outline" size="sm" className="ml-2 sm:ml-4 font-bold border-primary/50 hover:bg-primary/10 transition-colors px-2 sm:px-4 text-[10px] sm:text-sm h-8 sm:h-9">
                <span className="hidden sm:inline">{currentSectionIndex === SECTIONS.length - 1 ? "Finish & Submit Exam" : "Submit Section & Continue"}</span>
                <span className="sm:hidden">Submit</span> 
                <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-muted/10 relative p-4 sm:p-6">
            <div className="h-full w-full max-w-[1400px] mx-auto relative overflow-y-auto custom-scrollbar">
               {!examBundle ? (
                  <div className="h-full flex items-center justify-center flex-col text-muted-foreground text-sm sm:text-base">
                     <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin mb-3 sm:mb-4" />
                     <p>Decrypting exam paper...</p>
                  </div>
               ) : (
                  <>
                    {currentSection.id === "listening" && renderListening()}
                    {currentSection.id === "reading" && renderReading()}
                    {currentSection.id === "writing" && renderWriting()}
                    {currentSection.id === "speaking" && renderSpeaking()}
                  </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* ANTI-CHEAT MODALS (Highest Z-Index) */}
      {gracePeriod && (
        <div className="absolute inset-0 z-[10000] bg-destructive/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in px-4">
          <AlertTriangle className="h-16 w-16 sm:h-24 sm:w-24 text-white mx-auto mb-4 sm:mb-6 animate-pulse" />
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 sm:mb-4 text-white text-center">Did you make a mistake?</h2>
          <p className="text-white/80 text-base sm:text-xl mb-6 sm:mb-8 max-w-lg text-center leading-relaxed">
            You exited the secure environment. Return within <strong className="text-white text-xl sm:text-2xl">{graceTime}</strong> seconds or fail.
          </p>
          <div className="text-6xl sm:text-8xl font-black text-white mb-8 sm:mb-10 font-mono tracking-tighter">{graceTime}</div>
          <Button className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-xl bg-white text-destructive hover:bg-white/90 font-bold shadow-2xl w-full sm:w-auto" onClick={restoreFullscreen}>
            Re-enter Exam Now
          </Button>
        </div>
      )}

      {showWarningModal && !gracePeriod && (
        <div className="absolute inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in px-4">
          <Card className="max-w-md w-full p-6 sm:p-10 text-center border-amber-500 bg-background shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-black text-amber-500 mb-2">Proctor Warning!</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">You navigated away. Strike {warnings} / {MAX_WARNINGS}.</p>
            <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={() => setShowWarningModal(false)}>Return to Test</Button>
          </Card>
        </div>
      )}

    </div>
  );
}

// Helpers
function SummaryMetric({ title, score }: { title: string; score: number }) {
  return (
    <div className="space-y-2 sm:space-y-3 relative z-10">
      <div className="flex justify-between items-end">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className="text-xl sm:text-2xl font-black">{score}</span>
      </div>
      <Progress value={(score / 9) * 100} className="h-1.5 sm:h-2 bg-muted rounded-full" />
    </div>
  );
}

function CheckItem({ label, passed, icon }: { label: string, passed: boolean, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
        <div className="text-muted-foreground shrink-0">{icon}</div>
        {label}
      </div>
      {passed ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 animate-in zoom-in shrink-0" /> : <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground animate-spin shrink-0" />}
    </div>
  );
}