import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useGetLesson } from '@workspace/api-client-react';
import { PageLoader, Button, Card, Badge } from '@/components/ui';
import { ArrowLeft, CheckCircle, Code, Bug, TerminalSquare, AlertCircle } from 'lucide-react';

export default function Lesson() {
  const [, params] = useRoute('/lessons/:id');
  const lessonId = parseInt(params?.id || '0');
  
  const { data: lesson, isLoading } = useGetLesson(lessonId);
  const [activeTab, setActiveTab] = useState<'concept' | 'exercises'>('concept');

  if (isLoading) return <PageLoader />;
  if (!lesson) return <div>Lesson not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <Link href="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
      </Link>

      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <div className="flex gap-3 items-center mb-2">
            <Badge variant="outline" className="uppercase tracking-wider">{lesson.type}</Badge>
            <span className="text-sm text-muted-foreground">{lesson.estimatedMinutes} min read</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{lesson.title}</h1>
        </div>
        <Button variant="outline" className="gap-2">
          {lesson.isCompleted ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border border-current" />}
          {lesson.isCompleted ? "Completed" : "Mark as Complete"}
        </Button>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-8 border-b border-border">
        <button 
          onClick={() => setActiveTab('concept')}
          className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'concept' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Learning Material
          {activeTab === 'concept' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('exercises')}
          className={`pb-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'exercises' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Practice Exercises
          <Badge variant="secondary" className="px-1.5 py-0 min-w-5 flex justify-center text-[10px]">{lesson.exercises?.length || 0}</Badge>
          {activeTab === 'exercises' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'concept' && (
        <div className="prose prose-invert max-w-none">
          {/* In a real app, render markdown here. For now, simulate content */}
          <div className="p-8 rounded-2xl bg-card border border-border leading-relaxed text-lg text-foreground/90 whitespace-pre-wrap">
            {lesson.content || "Content goes here. Explain concepts clearly. Use examples."}
            
            <div className="my-8 p-6 bg-secondary/50 rounded-xl border-l-4 border-primary">
              <h3 className="text-xl font-bold mt-0 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" /> Key Takeaway
              </h3>
              <p className="mb-0">Always consider edge cases when writing test scripts. Happy path testing only covers 20% of potential real-world user behaviors.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'exercises' && (
        <div className="space-y-4">
          {lesson.exercises?.map((exercise) => (
            <Card key={exercise.id} className="interactive-card flex flex-col md:flex-row items-center p-6 gap-6">
              <div className="p-4 rounded-xl bg-secondary text-primary shrink-0">
                {exercise.type === 'write-automation' ? <Code className="h-8 w-8" /> : 
                 exercise.type === 'report-bug' ? <Bug className="h-8 w-8" /> : 
                 <TerminalSquare className="h-8 w-8" />}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h3 className="text-xl font-bold">{exercise.title}</h3>
                  <Badge variant="outline">{exercise.difficulty}</Badge>
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{exercise.points} XP</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{exercise.description}</p>
              </div>
              <Link href={`/exercises/${exercise.id}`} className="w-full md:w-auto">
                <Button className="w-full group">
                  Solve Exercise <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </Card>
          ))}
          {lesson.exercises?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
              No exercises for this lesson.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
