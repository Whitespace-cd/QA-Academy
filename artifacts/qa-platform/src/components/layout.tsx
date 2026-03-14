import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, BookOpen, Bug, FileCheck, 
  Trophy, UserCircle, LogOut, CodeSquare, ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui';

export function TopNavbar() {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/30 transition-colors">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            QA<span className="text-primary">Platform</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Catalog</Link>
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
              <Button variant="ghost" size="icon" onClick={logout} title="Log out">
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const SIDEBAR_NAV = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Bug Tracker', href: '/bug-tracker', icon: Bug },
  { name: 'Test Cases', href: '/test-cases', icon: FileCheck },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [...SIDEBAR_NAV];
  if (user?.role === 'instructor') {
    navItems.push({ name: 'Instructor Area', href: '/instructor', icon: CodeSquare });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-xl">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary/20 p-2.5 rounded-xl group-hover:bg-primary/30 transition-colors shadow-lg shadow-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              QA<span className="text-primary">Forge</span>
            </span>
          </Link>
        </div>

        <div className="px-4 py-2">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Lvl {user?.level || 1} <span className="w-1 h-1 rounded-full bg-primary" /> {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            QA<span className="text-primary">Forge</span>
          </span>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <ShieldCheck className="h-12 w-12 text-primary animate-pulse relative z-10" />
          </div>
          <p className="text-muted-foreground font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <SidebarLayout>{children}</SidebarLayout>;
}
