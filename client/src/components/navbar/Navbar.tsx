import { GraduationCap, Moon, Sun, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useTheme } from "../theme-provider"; 
import { Link } from "react-router-dom";
import { useProfile } from "@/features/settings/hooks/useProfile";

export function Navbar() {
  const { theme, setTheme } = useTheme(); 

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <Link to="/" className="text-xl font-bold tracking-tight text-primary">Kaizen</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#modules" className="transition-colors hover:text-foreground">Modules</a>
          <a href="#testimonials" className="transition-colors hover:text-foreground">Testimonials</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
        </nav>

        {/* Actions Container */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Theme Toggle (Always visible) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Desktop Auth Buttons (FIXED: Now wrapped with asChild Links) */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu (Hamburger) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-border">
                <div className="flex flex-col gap-8 mt-8">
                  <nav className="flex flex-col gap-4 text-lg font-medium text-muted-foreground">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
                    <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
                    <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
                  </nav>
                  
                  {/* Mobile Auth Buttons (FIXED: Maintained styles and added asChild Links) */}
                  <div className="flex flex-col gap-3 mt-4 pt-8 border-t border-border/40">
                    <Button variant="outline" className="w-full justify-center border-border bg-transparent" asChild>
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}