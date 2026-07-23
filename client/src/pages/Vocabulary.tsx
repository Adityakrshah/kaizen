// import { useState, useEffect, useCallback } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { Check, X, RotateCcw, Trophy, Loader2, Brain } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { request } from "@/shared/api/api";

// export function Vocabulary() {
//   const queryClient = useQueryClient();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [isFinished, setIsFinished] = useState(false);

//   // 1. Fetch real words from MongoDB
//   const { data: response, isLoading } = useQuery({
//     queryKey: ["vocab-practice"],
//     queryFn: () => request("/vocabulary/practice"),
//   });

//   const vocabList = response?.data || [];
//   const currentCard = vocabList[currentIndex];

//   // 2. Mastery Mutation to save progress
//   const masterMutation = useMutation({
//     mutationFn: (wordId: string) =>
//       request("/vocabulary/master", {
//         method: "POST",
//         body: { wordId },
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
//     },
//   });

//   const handleNext = useCallback((status: "mastered" | "learning") => {
//     if (!currentCard) return;
    
//     if (status === "mastered") {
//       masterMutation.mutate(currentCard._id);
//     }
    
//     setIsFlipped(false);
    
//     // Smooth transition delay
//     setTimeout(() => {
//       if (currentIndex < vocabList.length - 1) {
//         setCurrentIndex((prev) => prev + 1);
//       } else {
//         setIsFinished(true);
//       }
//     }, 200);
//   }, [currentCard, currentIndex, vocabList.length, masterMutation]);

//   // 3. Keyboard Controls (Space to Flip, Arrows to Mark)
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (isFinished || !currentCard) return;

//       if (e.code === "Space") {
//         e.preventDefault(); // Stop page from scrolling
//         setIsFlipped((prev) => !prev);
//       }

//       if (isFlipped) {
//         if (e.code === "ArrowRight") {
//           e.preventDefault();
//           handleNext("mastered");
//         }
//         if (e.code === "ArrowLeft") {
//           e.preventDefault();
//           handleNext("learning");
//         }
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isFlipped, currentCard, isFinished, handleNext]);

//   if (isLoading) {
//     return (
//       <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//         <p className="text-muted-foreground animate-pulse font-medium">Preparing your Kaizen session...</p>
//       </div>
//     );
//   }

//   if (isFinished || !currentCard) {
//     return (
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.9 }} 
//         animate={{ opacity: 1, scale: 1 }} 
//         className="flex h-[75vh] flex-col items-center justify-center text-center p-6"
//       >
//         <Trophy className="h-20 w-20 text-primary mb-6 drop-shadow-lg" />
//         <h2 className="text-4xl font-black italic">Session Complete</h2>
//         <p className="text-muted-foreground mt-2 max-w-xs text-lg">Your progress has been synced to your personal dashboard.</p>
//         <div className="flex gap-4 mt-8">
//             <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>View Stats</Button>
//             <Button onClick={() => window.location.reload()}>New Session</Button>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto min-h-[85vh] flex flex-col items-center justify-center py-8 space-y-10">
      
//       {/* Top Progress Bar */}
//       <div className="w-full max-w-2xl px-4 space-y-4">
//         <div className="flex justify-between items-end">
//           <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
//             <Brain className="h-4 w-4" /> Focused Study
//           </div>
//           <p className="font-mono text-lg font-bold">
//             {currentIndex + 1} <span className="opacity-30">/</span> {vocabList.length}
//           </p>
//         </div>
//         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
//             <motion.div 
//                 className="h-full bg-primary" 
//                 initial={{ width: 0 }}
//                 animate={{ width: `${((currentIndex + 1) / vocabList.length) * 100}%` }}
//             />
//         </div>
//       </div>

//       {/* Interactive Flashcard */}
//       <div className="relative w-full max-w-2xl aspect-[16/10] perspective-2000">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentIndex + (isFlipped ? "-back" : "-front")}
//             initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
//             animate={{ rotateY: 0, opacity: 1 }}
//             exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
//             transition={{ duration: 0.4, ease: "circOut" }}
//             onClick={() => setIsFlipped(!isFlipped)}
//             className="w-full h-full cursor-pointer group"
//           >
//             <div className={`w-full h-full rounded-[2.5rem] border border-white/10 p-12 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl transition-all duration-300 ${isFlipped ? 'bg-primary/5 border-primary/20 shadow-primary/5' : 'bg-card/40 hover:bg-card/60'}`}>
              
//               {!isFlipped ? (
//                 /* FRONT VIEW */
//                 <div className="space-y-6">
//                   <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground selection:bg-primary">
//                     {currentCard.word}
//                   </h1>
//                   {currentCard.phonetics && (
//                       <p className="text-xl font-mono text-muted-foreground/60 tracking-widest">{currentCard.phonetics}</p>
//                   )}
//                   <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] pt-4">Tap or Space to Flip</p>
//                 </div>
//               ) : (
//                 /* BACK VIEW */
//                 <div className="space-y-8 w-full max-w-xl text-left animate-in fade-in duration-500">
//                   <div className="space-y-2 border-b border-white/5 pb-6">
//                     <Badge className="bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest">
//                         {currentCard.type || 'Academic'}
//                     </Badge>
//                     <h2 className="text-4xl font-bold tracking-tight">{currentCard.word}</h2>
//                   </div>
                  
//                   {/* MEANING SECTION */}
//                   <div className="space-y-2">
//                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Definition</p>
//                     <p className="text-2xl font-semibold leading-tight text-foreground/90">{currentCard.meaning || "Analyzing meaning..."}</p>
//                   </div>

//                   {/* EXAMPLE SECTION */}
//                   <div className="space-y-2">
//                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Example Usage</p>
//                     <p className="text-lg italic text-muted-foreground leading-relaxed">"{currentCard.example}"</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* Controls & Keyboard Hints */}
//       <div className="w-full flex flex-col items-center gap-6">
//         <div className="h-16 flex items-center justify-center">
//             {isFlipped ? (
//             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-6">
//                 <Button 
//                     size="lg" 
//                     variant="outline" 
//                     className="h-14 px-8 rounded-2xl border-white/10 bg-card/40 hover:bg-destructive/10 hover:text-destructive transition-all group"
//                     onClick={(e) => { e.stopPropagation(); handleNext("learning"); }}
//                 >
//                     <X className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Still Learning
//                 </Button>
//                 <Button 
//                     size="lg" 
//                     className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/10 hover:scale-105 transition-all group"
//                     onClick={(e) => { e.stopPropagation(); handleNext("mastered"); }}
//                 >
//                     <Check className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> Mastered
//                 </Button>
//             </motion.div>
//             ) : (
//             <p className="text-muted-foreground/40 text-xs font-bold uppercase tracking-[0.2em]">Press Space to Reveal</p>
//             )}
//         </div>

//         {/* Action Hints */}
//         <div className="flex gap-10 opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">
//           <span className="flex items-center gap-2">← Learning</span>
//           <span className="flex items-center gap-2">Space: Flip</span>
//           <span className="flex items-center gap-2">Mastered →</span>
//         </div>
//       </div>

//       <style>{`.perspective-2000 { perspective: 2000px; }`}</style>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, RotateCcw, Trophy, Loader2, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { request } from "@/shared/api/api";

export function Vocabulary() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 1. Fetch real words from MongoDB
  const { data: response, isLoading } = useQuery({
    queryKey: ["vocab-practice"],
    queryFn: () => request("/vocabulary/practice"),
  });

  const vocabList = response?.data || [];
  const currentCard = vocabList[currentIndex];

  // 2. Mastery Mutation to save progress
  const masterMutation = useMutation({
    mutationFn: (wordId: string) =>
      request("/vocabulary/master", {
        method: "POST",
        body: { wordId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const handleNext = useCallback((status: "mastered" | "learning") => {
    if (!currentCard) return;
    
    if (status === "mastered") {
      masterMutation.mutate(currentCard._id);
    }
    
    setIsFlipped(false);
    
    // Smooth transition delay
    setTimeout(() => {
      if (currentIndex < vocabList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 200);
  }, [currentCard, currentIndex, vocabList.length, masterMutation]);

  // 3. Keyboard Controls (Space to Flip, Arrows to Mark)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || !currentCard) return;

      if (e.code === "Space") {
        e.preventDefault(); // Stop page from scrolling
        setIsFlipped((prev) => !prev);
      }

      if (isFlipped) {
        if (e.code === "ArrowRight") {
          e.preventDefault();
          handleNext("mastered");
        }
        if (e.code === "ArrowLeft") {
          e.preventDefault();
          handleNext("learning");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentCard, isFinished, handleNext]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] min-h-[300px] flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
        <p className="text-sm sm:text-base text-muted-foreground animate-pulse font-medium">Preparing your Kaizen session...</p>
      </div>
    );
  }

  if (isFinished || !currentCard) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex h-[70vh] min-h-[400px] flex-col items-center justify-center text-center p-6"
      >
        <Trophy className="h-16 w-16 sm:h-20 sm:w-20 text-primary mb-4 sm:mb-6 drop-shadow-lg" />
        <h2 className="text-3xl sm:text-4xl font-black italic">Session Complete</h2>
        <p className="text-muted-foreground mt-2 max-w-xs text-sm sm:text-lg">Your progress has been synced to your personal dashboard.</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto px-4 sm:px-0">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.href = "/dashboard"}>View Stats</Button>
            <Button className="w-full sm:w-auto" onClick={() => window.location.reload()}>New Session</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[85vh] flex flex-col items-center justify-center py-6 sm:py-8 space-y-6 sm:space-y-10 px-4 sm:px-6">
      
      {/* Top Progress Bar */}
      <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1.5 sm:gap-2 text-primary font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">
            <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Focused Study
          </div>
          <p className="font-mono text-sm sm:text-lg font-bold">
            {currentIndex + 1} <span className="opacity-30">/</span> {vocabList.length}
          </p>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                className="h-full bg-primary" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / vocabList.length) * 100}%` }}
            />
        </div>
      </div>

      {/* Interactive Flashcard */}
      <div className="relative w-full max-w-2xl aspect-[4/5] sm:aspect-[16/10] perspective-2000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex + (isFlipped ? "-back" : "-front")}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-full cursor-pointer group"
          >
            <div className={`w-full h-full rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 p-6 sm:p-12 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${isFlipped ? 'bg-primary/5 border-primary/20 shadow-primary/5' : 'bg-card/40 hover:bg-card/60'}`}>
              
              {!isFlipped ? (
                /* FRONT VIEW */
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-foreground selection:bg-primary break-words">
                    {currentCard.word}
                  </h1>
                  {currentCard.phonetics && (
                      <p className="text-sm sm:text-xl font-mono text-muted-foreground/60 tracking-widest">{currentCard.phonetics}</p>
                  )}
                  <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] sm:tracking-[0.3em] pt-2 sm:pt-4">Tap or Space to Flip</p>
                </div>
              ) : (
                /* BACK VIEW */
                <div className="space-y-6 sm:space-y-8 w-full max-w-xl text-left animate-in fade-in duration-500 max-h-full overflow-y-auto custom-scrollbar">
                  <div className="space-y-1.5 sm:space-y-2 border-b border-white/5 pb-4 sm:pb-6">
                    <Badge className="bg-primary text-primary-foreground px-2 sm:px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] uppercase font-black tracking-widest shrink-0">
                        {currentCard.type || 'Academic'}
                    </Badge>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight break-words">{currentCard.word}</h2>
                  </div>
                  
                  {/* MEANING SECTION */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Definition</p>
                    <p className="text-lg sm:text-2xl font-semibold leading-snug sm:leading-tight text-foreground/90">{currentCard.meaning || "Analyzing meaning..."}</p>
                  </div>

                  {/* EXAMPLE SECTION */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Example Usage</p>
                    <p className="text-sm sm:text-lg italic text-muted-foreground leading-relaxed">"{currentCard.example}"</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls & Keyboard Hints */}
      <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
        <div className="h-auto min-h-[4rem] sm:h-16 flex items-center justify-center w-full">
            {isFlipped ? (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row w-full sm:w-auto px-4 sm:px-0 gap-3 sm:gap-6">
                <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto rounded-xl sm:rounded-2xl border-white/10 bg-card/40 hover:bg-destructive/10 hover:text-destructive transition-all group text-sm sm:text-base"
                    onClick={(e) => { e.stopPropagation(); handleNext("learning"); }}
                >
                    <X className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform shrink-0" /> Still Learning
                </Button>
                <Button 
                    size="lg" 
                    className="h-12 sm:h-14 px-6 sm:px-10 w-full sm:w-auto rounded-xl sm:rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/10 hover:scale-105 transition-all group text-sm sm:text-base"
                    onClick={(e) => { e.stopPropagation(); handleNext("mastered"); }}
                >
                    <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform shrink-0" /> Mastered
                </Button>
            </motion.div>
            ) : (
            <p className="text-muted-foreground/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Press Space to Reveal</p>
            )}
        </div>

        {/* Action Hints - Hidden on mobile to avoid clutter since they primarily use touch */}
        <div className="hidden sm:flex gap-10 opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2">← Learning</span>
          <span className="flex items-center gap-2">Space: Flip</span>
          <span className="flex items-center gap-2">Mastered →</span>
        </div>
      </div>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}