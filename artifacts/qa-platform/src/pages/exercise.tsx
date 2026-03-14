import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useGetExercise, useCreateSubmission } from '@workspace/api-client-react';
import Editor from '@monaco-editor/react';
import { PageLoader, Button, Card, Badge, Textarea, Input, Label, Select } from '@/components/ui';
import { ArrowLeft, Code2, Play, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Exercise() {
  const [, params] = useRoute('/exercises/:id');
  const exerciseId = parseInt(params?.id || '0');
  
  const { data: exercise, isLoading } = useGetExercise(exerciseId);
  const [code, setCode] = useState('// Write your test script here\n');
  const [textAnswer, setTextAnswer] = useState('');
  
  const [result, setResult] = useState<any>(null);

  const submitMutation = useCreateSubmission({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
        if (data.status === 'passed') {
          toast.success(`Success! Earned ${data.pointsEarned} XP`);
        } else {
          toast.error('Tests failed. Check feedback.');
        }
      },
      onError: () => toast.error('Failed to submit exercise.')
    }
  });

  if (isLoading) return <PageLoader />;
  if (!exercise) return <div>Exercise not found</div>;

  const handleSubmit = () => {
    const content = exercise.type === 'write-automation' ? code : textAnswer;
    submitMutation.mutate({
      data: {
        exerciseId,
        content,
        language: exercise.type === 'write-automation' ? 'javascript' : undefined
      }
    });
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-in fade-in">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border shrink-0">
        <div>
          <Link href={`/lessons/${exercise.lessonId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {exercise.title}
            <Badge variant="outline">{exercise.type.replace('-', ' ')}</Badge>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-sm px-3 py-1">
            {exercise.points} XP Possible
          </Badge>
          <Button 
            onClick={handleSubmit} 
            isLoading={submitMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-lg"
          >
            <Play className="mr-2 h-4 w-4" /> Run & Evaluate
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Instructions Pane */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <Card className="bg-card/50 border-border h-full">
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" /> Task Instructions
              </h3>
              <div className="prose prose-invert text-sm text-muted-foreground whitespace-pre-wrap">
                {exercise.instructions}
              </div>
              
              {exercise.hints && exercise.hints.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400" /> Hints
                  </h4>
                  {exercise.hints.map((hint, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200/80 text-xs">
                      {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Editor / Form Pane */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 min-h-[400px]">
          <Card className="flex-1 overflow-hidden border-border flex flex-col shadow-2xl">
            {exercise.type === 'write-automation' ? (
              <div className="flex-1 rounded-lg overflow-hidden bg-[#1e1e1e]">
                {/* Monaco Editor Wrapper */}
                <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>test_script.js</span>
                  <span>JavaScript / Playwright</span>
                </div>
                <Editor
                  height="calc(100% - 36px)"
                  defaultLanguage="javascript"
                  theme="vs-dark"
                  value={exercise.template || code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            ) : (
              <div className="p-6 overflow-y-auto flex-1 bg-secondary/20">
                <Label className="text-lg mb-2">Your Answer / Test Plan</Label>
                <Textarea 
                  className="min-h-[300px] font-mono text-sm leading-relaxed" 
                  placeholder="Enter your structured response here..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                />
              </div>
            )}
          </Card>

          {/* Results Panel */}
          {result && (
            <Card className={`border shrink-0 animate-in slide-in-from-bottom-4 ${result.status === 'passed' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}>
              <div className="p-4 flex items-start gap-4">
                {result.status === 'passed' ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-rose-500 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-3">
                    Evaluation Result
                    <Badge variant="outline" className={result.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}>
                      Score: {result.score}/{result.maxScore}
                    </Badge>
                  </h3>
                  <p className="text-sm text-foreground/80 mb-3">{result.feedback}</p>
                  
                  {result.suggestions?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Suggestions</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground ml-4">
                        {result.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
