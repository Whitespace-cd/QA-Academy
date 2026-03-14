import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin, useRegister, RegisterRequestRole, RegisterRequestLearningPath } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, Select } from '@/components/ui';
import { ShieldCheck, ArrowRight, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name is required"),
  role: z.enum(['student', 'instructor']).default('student'),
  learningPath: z.enum(['manual-testing', 'automation-testing', 'api-testing', 'full-stack-qa']).default('manual-testing'),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuth();
  
  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Welcome back, ${data.user.name}!`);
        setAuthToken(data.token);
        setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to login. Check credentials.');
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        toast.success(`Account created successfully!`);
        setAuthToken(data.token);
        setLocation('/dashboard');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Registration failed.');
      }
    }
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '', role: 'student', learningPath: 'full-stack-qa' }
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data });
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: data as any });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left visual panel */}
      <div className="hidden md:flex flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Auth background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary font-medium mb-6 backdrop-blur-md border border-primary/20">
            <ShieldCheck className="h-5 w-5" />
            <span>QAForge Platform</span>
          </div>
          <h1 className="text-4xl font-display font-bold mb-4 leading-tight">
            Build software testing skills that <span className="text-primary">companies hire for.</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Access intentional buggy applications, write real test scripts, and get your work evaluated instantly by our engine.
          </p>
          <div className="space-y-4">
            {['Practice on real broken apps', 'Write & evaluate automation code', 'Build a verifiable QA portfolio'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-foreground font-medium">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <ArrowRight className="h-3 w-3" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative z-10 bg-card/50 backdrop-blur-xl md:border-l border-white/5">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8 md:hidden">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold">QAForge</h1>
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-secondary rounded-xl mb-8 border border-white/5">
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setIsLogin(false)}
            >
              Create Account
            </button>
          </div>

          <Card className="border-white/10 shadow-2xl bg-card/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Start your journey'}</CardTitle>
              <CardDescription>
                {isLogin ? 'Enter your credentials to access your dashboard.' : 'Create an account to track your progress.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="tester@example.com" {...loginForm.register('email')} />
                    {loginForm.formState.errors.email && <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" {...loginForm.register('password')} />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg mt-2" isLoading={loginMutation.isPending}>
                    Sign In
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input id="reg-name" placeholder="John Doe" {...registerForm.register('name')} />
                    {registerForm.formState.errors.name && <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="tester@example.com" {...registerForm.register('email')} />
                    {registerForm.formState.errors.email && <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" placeholder="••••••••" {...registerForm.register('password')} />
                    {registerForm.formState.errors.password && <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select {...registerForm.register('role')}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Focus Path</Label>
                      <Select {...registerForm.register('learningPath')}>
                        <option value="manual-testing">Manual</option>
                        <option value="automation-testing">Automation</option>
                        <option value="api-testing">API Testing</option>
                        <option value="full-stack-qa">Full Stack</option>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg mt-2" isLoading={registerMutation.isPending}>
                    Create Account
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
