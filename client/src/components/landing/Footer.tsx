import { GraduationCap } from "lucide-react";
import { FaXTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6"; // Standardizing to react-icons/fa6 which is usually installed with react-icons

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">Kaizen</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              AI-powered IELTS and PTE preparation platform. Master English proficiency exams with personalized learning paths.
            </p>
            <p className="text-muted-foreground text-sm">
              Made with care for learners worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#modules" className="hover:text-primary transition-colors">Modules</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">IELTS Tips</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">PTE Tips</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Study Guides</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Kaizen. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors"><FaXTwitter className="h-5 w-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><FaLinkedin className="h-5 w-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><FaInstagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}