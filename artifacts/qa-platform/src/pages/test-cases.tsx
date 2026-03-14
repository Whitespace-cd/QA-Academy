import React, { useState } from 'react';
import { useGetTestCases, useCreateTestCase } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Label, Select, Badge, PageLoader } from '@/components/ui';
import { FileCheck, Plus, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';

const testCaseSchema = z.object({
  title: z.string().min(5, "Title too short"),
  description: z.string().min(5),
  preconditions: z.string().min(5),
  testSteps: z.string().min(10, "Provide detailed steps"),
  expectedResult: z.string().min(5),
  testType: z.enum(['functional', 'regression', 'smoke', 'sanity', 'integration', 'performance']),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
});

export default function TestCases() {
  const [view, setView] = useState<'list' | 'create'>('list');
  const { data: testCases, isLoading, refetch } = useGetTestCases();

  const createMutation = useCreateTestCase({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Test case saved! Score: ${data.score}`);
        refetch();
        setView('list');
        form.reset();
      },
      onError: () => toast.error("Failed to save test case")
    }
  });

  const form = useForm<z.infer<typeof testCaseSchema>>({
    resolver: zodResolver(testCaseSchema),
    defaultValues: { testType: 'functional', priority: 'medium' }
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-primary" /> Test Case Repository
          </h1>
          <p className="text-muted-foreground mt-1">Design, write and structure professional test cases.</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-xl">
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-lg"><ListChecks className="h-4 w-4 mr-1"/> Repository</Button>
          <Button variant={view === 'create' ? 'default' : 'ghost'} size="sm" onClick={() => setView('create')} className="rounded-lg"><Plus className="h-4 w-4 mr-1"/> Write Test Case</Button>
        </div>
      </div>

      {view === 'create' ? (
        <Card className="border-border shadow-xl max-w-4xl mx-auto">
          <CardHeader className="border-b border-border bg-secondary/20">
            <CardTitle>Test Case Design Form</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate({ data: d as any }))} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Select {...form.register('testType')}>
                    <option value="functional">Functional</option>
                    <option value="smoke">Smoke</option>
                    <option value="regression">Regression</option>
                    <option value="integration">Integration</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select {...form.register('priority')}>
                    <option value="critical">P1 - Critical</option>
                    <option value="high">P2 - High</option>
                    <option value="medium">P3 - Medium</option>
                    <option value="low">P4 - Low</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Verify user can checkout with valid credit card" {...form.register('title')} />
              </div>

              <div className="space-y-2">
                <Label>Description / Objective</Label>
                <Textarea placeholder="Brief summary of what this test verifies..." {...form.register('description')} />
              </div>

              <div className="space-y-2">
                <Label>Preconditions</Label>
                <Textarea placeholder="What must be true before running this test? (e.g., User is logged in, item is in cart)" {...form.register('preconditions')} />
              </div>

              <div className="space-y-2">
                <Label>Test Steps</Label>
                <Textarea className="font-mono text-sm min-h-[150px]" placeholder="1. Navigate to /checkout&#10;2. Enter valid card details&#10;3. Click 'Pay Now'" {...form.register('testSteps')} />
              </div>

              <div className="space-y-2">
                <Label>Expected Result</Label>
                <Textarea placeholder="What is the exact expected outcome?" {...form.register('expectedResult')} />
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="submit" size="lg" isLoading={createMutation.isPending}>Save to Repository</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testCases?.map(tc => (
            <Card key={tc.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">TC-{tc.id.toString().padStart(4, '0')}</span>
                    <Badge variant="secondary" className="capitalize">{tc.testType}</Badge>
                    <Badge variant="outline" className="capitalize text-muted-foreground">{tc.priority}</Badge>
                  </div>
                  <h3 className="font-bold text-lg">{tc.title}</h3>
                </div>
                {tc.score !== null && (
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-emerald-500">{tc.score}/100</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Quality Score</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {testCases?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Your repository is empty.</p>
              <Button variant="outline" className="mt-4" onClick={() => setView('create')}>Write first test case</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
