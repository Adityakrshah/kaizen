import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  GraduationCap, LayoutDashboard, BookOpen, Headphones, 
  BookText, PenTool, Mic, FileSpreadsheet, Settings, 
  LogOut, Menu, Sun, Moon, ChevronLeft, ChevronRight 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useSession, signOut } from "@/lib/auth-client";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vocabulary', href: '/vocabulary', icon: BookOpen },
  { name: 'Listening', href: '/listening', icon: Headphones },
  { name: 'Reading', href: '/reading', icon: BookText },
  { name: 'Writing', href: '/writing', icon: PenTool },
  { name: 'Speaking', href: '/speaking', icon: Mic },
  { name: 'Mock Tests', href: '/mocktest', icon: FileSpreadsheet },
];

export function AppLayout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : "U";

  const SidebarContent = ({ collapsed = false, isMobile = false }: { collapsed?: boolean, isMobile?: boolean }) => (
    <div className="flex h-full flex-col gap-4">
      <div className={`flex h-16 shrink-0 items-center ${collapsed ? 'justify-center' : 'px-6'}`}>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-xl font-bold tracking-tight text-primary truncate">Kaizen</span>}
        </Link>
      </div>
      
      <nav className="flex flex-1 flex-col gap-2 px-3 overflow-y-auto py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg py-2.5 transition-colors ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {!collapsed && <span className="text-sm font-medium truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 flex flex-col gap-2">
        <Link to="/settings" className={`flex items-center gap-3 rounded-lg py-2.5 transition-colors ${collapsed ? 'justify-center px-0' : 'px-3'} ${location.pathname === '/settings' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
        {!isMobile && (
          <div className="hidden md:flex items-center justify-end border-t border-border/40 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start px-3'} text-muted-foreground hover:text-foreground`}>
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <><ChevronLeft className="h-5 w-5 mr-2" /><span>Collapse</span></>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className={`hidden md:flex flex-col fixed inset-y-0 z-50 border-r border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-4 md:px-8 backdrop-blur shadow-sm">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="left" className="w-64 p-0"><SidebarContent collapsed={false} isMobile={true} /></SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">{getInitials(session?.user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session?.user?.name || "Loading..."}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email || ""}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet /> {/* 🚀 THIS IS WHERE YOUR PAGES RENDER */}
        </main>
      </div>
    </div>
  );
}