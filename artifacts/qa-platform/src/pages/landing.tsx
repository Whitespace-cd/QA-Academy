import React from 'react';
import { Link } from 'wouter';
import { TopNavbar } from '@/components/layout';
import { Button } from '@/components/ui';
import { ShieldCheck, Bug, Code, CheckCircle, ArrowRight, Zap, Trophy, Users, FileCheck } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background to-background"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            <span>The #1 Hands-on QA Training Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Learn QA Testing Like a <br />
            <span className="text-gradient">Real Engineering Pro</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop watching boring videos. Write test cases, report bugs in broken apps, build automation scripts, and get instant AI-driven feedback.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full group">
                Start Learning for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="glass" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                Explore Curriculum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Master Every QA Discipline</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our platform simulates a real corporate engineering environment so you're ready for day one on the job.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="interactive-card p-8 bg-card border-border">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 text-blue-500">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Manual Testing</h3>
              <p className="text-muted-foreground">Learn to write comprehensive test plans, structured test cases, and identify edge cases in complex features.</p>
            </div>
            
            <div className="interactive-card p-8 bg-card border-border">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20 text-rose-500">
                <Bug className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bug Reporting</h3>
              <p className="text-muted-foreground">Practice on our intentionally broken demo apps. Write professional bug reports with expected vs actual results.</p>
            </div>
            
            <div className="interactive-card p-8 bg-card border-border">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 text-emerald-500">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Test Automation</h3>
              <p className="text-muted-foreground">Write real Playwright, Cypress, and API tests in our built-in code editor. Get your scripts evaluated instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">50+</div>
              <div className="text-sm font-medium text-muted-foreground">Interactive Lessons</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-accent mb-2">4</div>
              <div className="text-sm font-medium text-muted-foreground">Broken Demo Apps</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-emerald-400 mb-2">Auto</div>
              <div className="text-sm font-medium text-muted-foreground">Code Evaluation</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-purple-400 mb-2">10k+</div>
              <div className="text-sm font-medium text-muted-foreground">Tests Written</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QAForge Training Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
