import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetUserProgress, useGetCourses } from '@workspace/api-client-react';
import { Card, CardHeader, CardTitle, CardContent, PageLoader, Button, Badge } from '@/components/ui';
import { Trophy, BookOpen, Bug, CheckCircle, Flame, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { formatScore } from '@/lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: progress, isLoading: loadingProgress } = useGetUserProgress(user?.id || 0, {
    query: { enabled: !!user?.id }
  });

  const { data: courses, isLoading: loadingCourses } = useGetCourses();

  if (loadingProgress || loadingCourses) return <PageLoader />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              You're currently Level {user?.level}. Keep testing to rank up!
            </p>
          </div>
          <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Score</div>
              <div className="text-3xl font-bold text-foreground">{progress?.totalScore || 0} <span className="text-sm text-muted-foreground font-normal">XP</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="interactive-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{progress?.enrolledCourses || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Enrolled Courses</div>
            </div>
          </CardContent>
        </Card>
        <Card className="interactive-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{progress?.completedLessons || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Lessons Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card className="interactive-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400">
              <Bug className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{progress?.bugReportsCount || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Bugs Reported</div>
            </div>
          </CardContent>
        </Card>
        <Card className="interactive-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{progress?.submissionsCount || 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Exercises Solved</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recommended / Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">Continue Learning</h2>
            <Link href="/courses" className="text-primary text-sm font-medium hover:underline flex items-center">
              Browse Catalog <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {courses?.slice(0, 2).map((course) => (
              <Card key={course.id} className="interactive-card flex flex-col h-full">
                <div className="h-32 bg-secondary relative overflow-hidden">
                  <img 
                    src={course.imageUrl || `${import.meta.env.BASE_URL}images/course-placeholder.png`}
                    alt={course.title} 
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">{course.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{course.description}</p>
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full group">
                      <PlayCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> 
                      Resume Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold">Recent Activity</h2>
          <Card className="h-[400px] overflow-hidden flex flex-col">
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {progress?.recentActivity && progress.recentActivity.length > 0 ? (
                <div className="divide-y divide-border">
                  {progress.recentActivity.map((activity, i) => (
                    <div key={i} className="p-4 hover:bg-secondary/50 transition-colors flex gap-4">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground">{format(new Date(activity.createdAt), 'MMM d, h:mm a')}</span>
                          {activity.score && (
                            <span className="text-xs font-bold text-emerald-400">+{activity.score} XP</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                  <Trophy className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm">No activity yet. Start your first lesson!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
