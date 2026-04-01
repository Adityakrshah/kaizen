import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    features: [
      "100 vocabulary words",
      "5 listening exercises",
      "3 reading passages",
      "Basic progress tracking",
      "Community support",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious exam preparation",
    price: "$19",
    period: "/per month",
    features: [
      "Unlimited vocabulary access",
      "All listening exercises",
      "All reading passages",
      "AI writing feedback",
      "Speaking practice with AI",
      "Full mock tests",
      "Detailed analytics",
      "Priority support",
    ],
    buttonText: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For schools and institutions",
    price: "Custom",
    period: "/per institution",
    features: [
      "Everything in Pro",
      "Unlimited user accounts",
      "Admin dashboard",
      "Student progress reports",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Training sessions",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-background/50 border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-border/50 bg-muted/20 text-muted-foreground mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your learning journey. All plans include a 7-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative flex flex-col p-8 rounded-2xl border backdrop-blur-sm ${
                plan.popular 
                  ? "border-primary bg-primary/5 shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)]" 
                  : "border-border/50 bg-card/50 hover:border-border transition-colors"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary border-none px-3 py-1 shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full h-12 ${
                  plan.popular 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-transparent border border-border text-foreground hover:bg-muted/50"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center text-sm text-muted-foreground">
          All prices in USD. Cancel anytime. No hidden fees.
        </div>
      </div>
    </section>
  );
}