import { Brain, Target, Clock, BarChart3, MessageSquare, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const features = [
  {
    title: "AI-Powered Feedback",
    description: "Get instant, personalized feedback on your writing and speaking with advanced AI analysis.",
    icon: Brain,
  },
  {
    title: "Adaptive Learning",
    description: "Our algorithm adjusts difficulty based on your performance, focusing on areas that need improvement.",
    icon: Target,
  },
  {
    title: "Realistic Simulations",
    description: "Practice with timed mock tests that mirror the actual exam experience perfectly.",
    icon: Clock,
  },
  {
    title: "Progress Analytics",
    description: "Track your improvement with detailed analytics and insights on every skill area.",
    icon: BarChart3,
  },
  {
    title: "24/7 AI Tutor",
    description: "Ask questions anytime. Our AI tutor provides explanations, tips, and guidance around the clock.",
    icon: MessageSquare,
  },
  {
    title: "Quick Practice",
    description: "Short, focused exercises for busy schedules. Improve in just 15 minutes a day.",
    icon: Zap,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kaizen combines cutting-edge AI technology with proven learning methodologies to help you achieve your target score faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors backdrop-blur-sm">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}