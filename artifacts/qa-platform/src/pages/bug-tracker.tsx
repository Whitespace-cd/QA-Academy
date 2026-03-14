import React, { useState } from 'react';
import { useGetBugReports, useCreateBugReport, useGetDemoApps } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Label, Select, Badge, PageLoader } from '@/components/ui';
import { Bug, Plus, ExternalLink, AlertTriangle } from 'lucide-react';
import { getDifficultyColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const bugSchema = z.object({
  demoAppId: z.coerce.number().min(1, "Select an app"),
  title: z.string().min(5),
  description: z.string().min(10),
  stepsToReproduce: z.string().min(10),
  expectedResult: z.string().min(5),
  actualResult: z.string().min(5),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
});

export default function BugTracker() {
  const [view, setView] = useState<'list' | 'create'>('list');
  
  const { data: bugs, isLoading: loadingBugs, refetch } = useGetBugReports();
  const { data: apps, isLoading: loadingApps } = useGetDemoApps();

  const createMutation = useCreateBugReport({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Bug logged! Auto-eval score: ${data.score}/100`);
        refetch();
        setView('list');
        form.reset();
      },
      onError: () => toast.error("Failed to submit bug report")
    }
  });

  const form = useForm<z.infer<typeof bugSchema>>({
    resolver: zodResolver(bugSchema),
    defaultValues: { severity: 'medium' }
  });

  if (loadingBugs || loadingApps) return <PageLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Bug className="h-8 w-8 text-rose-500" /> Bug Tracking System
          </h1>
          <p className="text-muted-foreground mt-1">Report, track, and get AI evaluation on bugs found in demo apps.</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-xl">
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-lg">My Reports</Button>
          <Button variant={view === 'create' ? 'default' : 'ghost'} size="sm" onClick={() => setView('create')} className="rounded-lg"><Plus className="h-4 w-4 mr-1"/> Log Bug</Button>
        </div>
      </div>

      {view === 'create' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-border shadow-xl">
            <CardHeader className="border-b border-border bg-secondary/20">
              <CardTitle>Submit New Bug Report</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d as any }))} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Application</Label>
                    <Select {...form.register('demoAppId')}>
                      <option value="">Select App...</option>
                      {apps?.map(app => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                      ))}
                    </Select>
                    {form.formState.errors.demoAppId && <p className="text-xs text-destructive">{form.formState.errors.demoAppId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select {...form.register('severity')}>
                      <option value="critical">Critical (P1)</option>
                      <option value="high">High (P2)</option>
                      <option value="medium">Medium (P3)</option>
                      <option value="low">Low (P4)</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bug Title</Label>
                  <Input placeholder="E.g., Checkout button unresponsive on mobile viewport" {...form.register('title')} />
                  {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Provide context about the issue..." {...form.register('description')} />
                </div>

                <div className="space-y-2">
                  <Label>Steps to Reproduce</Label>
                  <Textarea className="font-mono text-sm min-h-[120px]" placeholder="1. Go to...\n2. Click on...\n3. Observe..." {...form.register('stepsToReproduce')} />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Expected Result</Label>
                    <Textarea placeholder="What should happen?" {...form.register('expectedResult')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Result</Label>
                    <Textarea placeholder="What actually happens?" {...form.register('actualResult')} />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg" isLoading={createMutation.isPending}>Submit & Evaluate Bug</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold flex items-center gap-2 mb-2 text-primary">
                  <AlertTriangle className="h-5 w-5" /> AI Evaluation Rules
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Title must be concise and descriptive</li>
                  <li>Steps must be numbered and reproducible</li>
                  <li>Expected/Actual results must clearly contrast</li>
                  <li>Severity must align with the actual impact</li>
                </ul>
              </CardContent>
            </Card>

            {apps && apps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Available Target Apps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {apps.map(app => (
                    <div key={app.id} className="p-3 bg-secondary/50 rounded-lg text-sm flex justify-between items-center border border-border hover:border-primary/30 transition-colors">
                      <span className="font-medium">{app.name}</span>
                      <a href={app.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {bugs?.map(bug => (
            <Card key={bug.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge className={getDifficultyColor(bug.severity)}>{bug.severity.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground font-mono">APP-{bug.demoAppId}</span>
                    <Badge variant="outline">{bug.status}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{bug.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{bug.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold font-display text-primary">{bug.score ? `${bug.score}` : '-'}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Eval Score</div>
                </div>
              </CardContent>
            </Card>
          ))}
          {bugs?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
              <Bug className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No bugs reported yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setView('create')}>Log your first bug</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
