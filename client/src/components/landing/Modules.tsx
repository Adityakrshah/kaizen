import { Book, Headphones, FileText, PenTool, Mic, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const modules = [
  {
    title: "Vocabulary Builder",
    description: "Learn 2000+ essential words with flashcards, contextual examples, and spaced repetition.",
    icon: Book,
    tags: ["Flashcard System", "Audio Pronunciation", "Progress Tracking"],
  },
  {
    title: "Listening Practice",
    description: "Train with authentic audio materials across all question types and difficulty levels.",
    icon: Headphones,
    tags: ["Audio Player", "Speed Control", "Auto-Scoring"],
  },
  {
    title: "Reading Comprehension",
    description: "Master reading strategies with timed passages and instant feedback on your answers.",
    icon: FileText,
    tags: ["Split View", "Highlight Tools", "Question Navigation"],
  },
  {
    title: "Writing Workshop",
    description: "Improve your essays with AI-powered grammar checking and band score predictions.",
    icon: PenTool,
    tags: ["AI Scoring", "Grammar Check", "Sample Essays"],
  },
  {
    title: "Speaking Studio",
    description: "Practice speaking with voice recording, pronunciation analysis, and detailed feedback.",
    icon: Mic,
    tags: ["Voice Recording", "Fluency Analysis", "Model Answers"],
    highlight: true, // Special styling for the active/highlighted card in the screenshot
  },
];

export function Modules() {
  return (
    <section id="modules" className="py-20 bg-background/50 border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-border/50 bg-muted/20 text-muted-foreground mb-4">
            Learning Modules
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Comprehensive skill coverage
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Five specialized modules designed to develop every skill tested in IELTS and PTE exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, index) => (
            <Card 
              key={index} 
              className={`flex flex-col h-full border-border/50 backdrop-blur-sm transition-colors ${
                mod.highlight 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-card/50 hover:border-primary/30"
              }`}
            >
              <CardHeader>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${
                  mod.highlight ? "bg-primary/20" : "bg-muted"
                }`}>
                  <mod.icon className={`h-6 w-6 ${mod.highlight ? "text-primary" : "text-foreground"}`} />
                </div>
                <CardTitle className="text-xl text-foreground">{mod.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-base pt-2">
                  {mod.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {mod.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="bg-secondary/50 text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <a href="#" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
          
          {/* CTA Card */}
          <Card className="flex flex-col h-full items-center justify-center text-center p-8 bg-gradient-to-br from-card/50 to-primary/5 border-primary/20 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-2">Ready to start?</h3>
            <p className="text-muted-foreground mb-6">Begin your journey to exam success today with a free trial.</p>
            <a href="#" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-6 py-2">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
}