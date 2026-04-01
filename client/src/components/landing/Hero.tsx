import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32 pb-16">
      <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
          <Sparkles className="mr-2 h-4 w-4" />
          AI-Powered Learning Platform
        </div>

        {/* Main Heading */}
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          Master IELTS & PTE <br className="hidden sm:block" />
          with <span className="text-primary">Intelligent Practice</span>
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl mb-10">
          Personalized learning paths, AI-powered feedback, and realistic mock tests. Achieve your target band score with Kaizen's comprehensive exam preparation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Button asChild size="lg" className="w-full sm:w-auto text-md h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
            <Link to="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-md h-12 px-8 bg-transparent border-border hover:bg-muted/50 cursor-pointer">
            <Link to="/features"> {/* Or wherever you want the demo to go */}
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-16 pt-8 border-t border-border/40 w-full max-w-4xl">
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-3xl md:text-4xl font-bold">50K+</h3>
            <p className="text-sm text-muted-foreground">Active Learners</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-3xl md:text-4xl font-bold">8.0</h3>
            <p className="text-sm text-muted-foreground">Avg. Band Score</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-3xl md:text-4xl font-bold">95%</h3>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <h3 className="text-3xl md:text-4xl font-bold">24/7</h3>
            <p className="text-sm text-muted-foreground">AI Support</p>
          </div>
        </div>

      </div>
      
      {/* Background Gradient Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}