import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";

const testimonials = [
  {
    quote: "Kaizen's AI feedback on my writing was a game-changer. I improved from 6.5 to 8.0 in just 2 months. The personalized suggestions helped me understand exactly where I was going wrong.",
    name: "Sarah Chen",
    score: "IELTS Band 8.0",
    initials: "SC",
    tag: "2 months to Band 8.0",
  },
  {
    quote: "The speaking practice module is incredible. Recording myself and getting instant pronunciation feedback helped me gain confidence. The mock tests were exactly like the real exam.",
    name: "Mohammed Al-Hassan",
    score: "PTE Score 85",
    initials: "MA",
    tag: "PTE Score: 85",
  },
  {
    quote: "I was struggling with the reading section until I started using Kaizen. The timed practice and strategy tips made a huge difference. Went from 6.0 to 7.5 in reading!",
    name: "Priya Sharma",
    score: "IELTS Band 7.5",
    initials: "PS",
    tag: "+1.5 Band in Reading",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-border/50 bg-muted/20 text-muted-foreground mb-4">
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Loved by thousands of learners
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join over 50,000 students who have achieved their target scores with Kaizen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((test, index) => (
            <Card key={index} className="flex flex-col h-full bg-card/50 border-border/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#FFC107] text-[#FFC107]" />
                ))}
              </div>
              <CardContent className="p-0 flex-grow">
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  "{test.quote}"
                </p>
              </CardContent>
              <CardFooter className="p-0 flex items-center justify-between w-full mt-auto">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {test.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm">{test.name}</span>
                    <span className="text-xs text-muted-foreground">{test.score}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-secondary/50 text-xs font-normal">
                  {test.tag}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}