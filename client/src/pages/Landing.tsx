import React from "react";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Mic, 
  PenTool, 
  Headphones, 
  Zap,
  Globe,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      
      {/* 🧭 NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Kaizen</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#mission" className="hover:text-primary transition-colors">Our Mission</a>
            <div className="h-4 w-[1px] bg-border" />
            <Link to="/login" className="hover:text-primary transition-colors">Log in</Link>
            <Link to="/signup">
              <Button size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        
        {/* 🚀 HERO SECTION */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI-Powered Mastery — 100% Free</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Master IELTS & PTE.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                Zero Cost. No Limits.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Experience the world's most advanced learning platform for international exams. 
              Built with AI to give you instant feedback, tailored to your target band score.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full shadow-2xl shadow-primary/20 group">
                  Start Learning Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg font-bold rounded-full border-2">
                  Welcome Back
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50">
                <div className="flex items-center gap-2 font-bold"><Globe className="h-5 w-5" /> Global Standards</div>
                <div className="flex items-center gap-2 font-bold"><Zap className="h-5 w-5" /> Instant AI Feedback</div>
                <div className="flex items-center gap-2 font-bold"><Heart className="h-5 w-5" /> Community Driven</div>
            </div>
          </div>
        </section>

        {/* 🛠️ FEATURES GRID */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Everything You Need to Succeed</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Elite tools that usually cost hundreds, now accessible to everyone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<PenTool className="h-6 w-6 text-primary" />}
                title="AI Writing Coach"
                desc="Submit your essays and get instant band scores with detailed grammar and lexical analysis."
              />
              <FeatureCard 
                icon={<Mic className="h-6 w-6 text-primary" />}
                title="Speaking Simulator"
                desc="Realistic AI-conducted interviews that analyze your fluency, pronunciation, and pacing."
              />
              <FeatureCard 
                icon={<BookOpen className="h-6 w-6 text-primary" />}
                title="Reading Hub"
                desc="Interactive passages with adaptive difficulty and real-time explanation of answers."
              />
              <FeatureCard 
                icon={<Headphones className="h-6 w-6 text-primary" />}
                title="Audio Mastery"
                desc="Dynamic listening exercises with varying accents to prepare you for the real test environment."
              />
            </div>
          </div>
        </section>

        {/* ❤️ MISSION SECTION */}
        <section id="mission" className="py-24 border-t">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter mb-6">Why is Kaizen Free?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed italic">
              "We believe that a price tag should never stand between a student and their dreams of studying abroad. 
              Kaizen is our commitment to democratizing education. No hidden fees, no 'pro' tiers, just pure learning."
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
               {["Full Access", "No Credit Card", "No Ad-Hoc Fees", "Lifetime Free"].map((item) => (
                 <div key={item} className="flex items-center gap-2 text-sm font-bold bg-muted px-4 py-2 rounded-full">
                   <CheckCircle2 className="h-4 w-4 text-green-500" /> {item}
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* 🏁 FINAL CTA */}
        <section className="py-24 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary opacity-[0.03]" />
           <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic">Ready to reach your goal?</h2>
              <Link to="/signup">
                <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-full group">
                  Get Started for Free <ArrowRight className="ml-4 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
           </div>
        </section>
      </main>

      {/* 👣 FOOTER */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale opacity-70">
            <GraduationCap className="h-5 w-5" />
            <span className="font-bold tracking-tighter uppercase">Kaizen © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">Made with ❤️ for students everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </div>
  );
}