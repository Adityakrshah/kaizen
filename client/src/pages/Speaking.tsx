import { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, RotateCcw, AlertCircle, CheckCircle2, ChevronRight, Volume2, Loader2, Info, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export function Speaking() {
  const [status, setStatus] = useState<"idle" | "recording" | "review" | "processing" | "finished">("idle");
  const [timeRemaining, setTimeRemaining] = useState(40);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePrompt, setActivePrompt] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetchNewPrompt();
  }, []);

  const fetchNewPrompt = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/speaking/prompts/random`, { withCredentials: true });
      if (res.data.success) {
        setActivePrompt(res.data.data);
        resetRecording();
      }
    } catch (err) {
      console.error("Failed to fetch prompt", err);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (status === "recording" && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0 && status === "recording") {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [status, timeRemaining]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };
      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      alert("Microphone access denied! Check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      setStatus("review");
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setStatus("idle");
    setTimeRemaining(40);
    setIsPlaying(false);
    setResults(null);
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) { audioPlayerRef.current.pause(); setIsPlaying(false); }
      else { audioPlayerRef.current.play(); setIsPlaying(true); }
    }
  };

  const submitForAnalysis = async () => {
    if (!audioUrl || !activePrompt) return;
    setStatus("processing");

    try {
      const audioBlob = await fetch(audioUrl).then(r => r.blob());
      const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("topic", activePrompt.prompt);

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/speaking/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      if (res.data.success) {
        setResults(res.data.data);
        setStatus("finished");
      }
    } catch (err) {
      console.error("Analysis Error:", err);
      setStatus("review");
      alert("Analysis failed. Ensure server is running on port 5000.");
    }
  };

  const formatTime = (s: number) => `0:${s < 10 ? '0' : ''}${s}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10 px-4">
      {audioUrl && <audio ref={audioPlayerRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 px-3 py-1 uppercase tracking-wider">
              {activePrompt?.type?.replace('_', ' ') || "Read Aloud"}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Speaking Studio</h1>
          <p className="text-muted-foreground">Speak naturally. AI will evaluate your fluency and pronunciation.</p>
        </div>
        <Button variant="ghost" onClick={fetchNewPrompt} className="hover:bg-muted/50">
          Skip <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/40 border-border/50 backdrop-blur-sm shadow-sm p-8 min-h-[160px] flex items-center">
            {activePrompt ? (
              <p className="text-2xl leading-relaxed text-foreground font-medium italic">
                "{activePrompt.prompt}"
              </p>
            ) : (
              <div className="w-full flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            )}
          </Card>

          <Card className={`border shadow-lg transition-all duration-500 h-[400px] flex flex-col items-center justify-center ${status === "recording" ? "bg-primary/5 border-primary/50 shadow-primary/10" : "bg-card/40 border-border/50"}`}>
              <div className="text-center space-y-4 mb-10">
                <h3 className="text-2xl font-bold">
                  {status === "idle" && "Ready to record?"}
                  {status === "recording" && "Recording live..."}
                  {status === "review" && "Review your audio"}
                  {status === "processing" && "AI is analyzing..."}
                  {status === "finished" && "Analysis Complete"}
                </h3>
                {(status === "idle" || status === "recording") && (
                  <p className={`text-5xl font-mono font-bold ${timeRemaining < 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                    {formatTime(timeRemaining)}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
                {status === "idle" && (
                  <Button size="lg" onClick={startRecording} className="h-20 w-20 rounded-full bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    <Mic className="h-8 w-8 text-white" />
                  </Button>
                )}
                {status === "recording" && (
                  <Button size="lg" onClick={stopRecording} variant="destructive" className="h-20 w-20 rounded-full animate-pulse shadow-xl shadow-destructive/20">
                    <Square className="h-8 w-8 fill-current text-white" />
                  </Button>
                )}
                {status === "review" && (
                  <div className="w-full space-y-4 animate-in slide-in-from-bottom-4">
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={resetRecording} className="flex-1 h-12"><RotateCcw className="mr-2 h-4 w-4"/> Retake</Button>
                        <Button variant="secondary" onClick={togglePlayback} className="flex-1 h-12">{isPlaying ? "Stop" : "Playback"}</Button>
                    </div>
                    <Button onClick={submitForAnalysis} className="w-full h-14 bg-primary text-lg shadow-lg hover:bg-primary/90">
                      Submit for AI Analysis <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                )}
                {status === "processing" && (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Whisper is transcribing...</p>
                  </div>
                )}
                {status === "finished" && (
                  <Button variant="outline" onClick={fetchNewPrompt} className="h-12 px-8 border-primary/20 text-primary hover:bg-primary/10">
                    Try Another Prompt <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
          </Card>
        </div>

        <div className="lg:col-span-1 min-h-[500px]">
          {status !== "finished" ? (
            <Card className="h-full bg-card/40 border-border/50 p-8 space-y-8 flex flex-col">
              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-foreground"><Info className="h-5 w-5 text-primary" /> Scoring Criteria</h4>
                <p className="text-xs text-muted-foreground">Based on official PTE/IELTS standards</p>
              </div>
              <div className="space-y-6 text-sm text-muted-foreground">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                  <h5 className="font-bold text-foreground mb-1">Oral Fluency</h5>
                  <p className="leading-relaxed">Smooth rhythm, no false starts or unnatural hesitations.</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                  <h5 className="font-bold text-foreground mb-1">Pronunciation</h5>
                  <p className="leading-relaxed">Vowels and consonants are clearly distinguished and understandable.</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full border-primary/20 bg-card/40 p-8 animate-in slide-in-from-right-4 duration-500 flex flex-col shadow-xl">
                <div className="text-center p-8 bg-primary/5 rounded-2xl border border-primary/10 mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Overall AI Score</p>
                  <div className="text-7xl font-black text-foreground">{results?.score}<span className="text-2xl text-muted-foreground">/10</span></div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold uppercase tracking-tight"><span>Pronunciation</span><span>{results?.pronunciation}/10</span></div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(results?.pronunciation/10)*100}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-bold uppercase tracking-tight"><span>Oral Fluency</span><span>{results?.fluency}/10</span></div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all duration-1000" style={{ width: `${(results?.fluency/10)*100}%` }} /></div>
                  </div>
                </div>

                <div className="mt-10 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex-1">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-amber-500 mb-3"><AlertCircle className="h-4 w-4" /> Improvement Areas</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-amber-500/30 pl-4">
                    {results?.feedback || results?.overallFeedback || "Great effort! Focus on word stress for higher pronunciation scores."}
                  </p>
                </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}