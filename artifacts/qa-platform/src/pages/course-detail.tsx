import React from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetCourse, useEnrollCourse } from '@workspace/api-client-react';
import { PageLoader, Button, Badge, Card, CardContent } from '@/components/ui';
import { Clock, BookOpen, Users, Star, ArrowRight, PlayCircle, CheckCircle } from 'lucide-react';
import { getDifficultyColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const [, params] = useRoute('/courses/:id');
  const courseId = parseInt(params?.id || '0');
  const [, setLocation] = useLocation();

  const { data: course, isLoading, refetch } = useGetCourse(courseId);
  const enrollMutation = useEnrollCourse({
    mutation: {
      onSuccess: () => {const firstLessonId = course.modules?.[0]?.id || 1;
        toast.success('Successfully enrolled!');
        refetch();
      },
      onError: () => toast.error('Failed to enroll.')
    }
  });

  if (isLoading) return <PageLoader />;
  if (!course) return <div className="text-center py-20">Course not found</div>;

  const handleAction = () => {
    if (course.isEnrolled) {
      setLocation(`/courses/${courseId}/learn`);
    } else {
      enrollMutation.mutate({ id: courseId });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-border">
        <div className="absolute inset-0">
          <img 
            src={course.imageUrl || `${import.meta.env.BASE_URL}images/course-placeholder.png`} 
            alt={course.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-6">
            <div className="flex gap-3 flex-wrap">
              <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
              <Badge variant="secondary" className="bg-white/5">{course.category}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">{course.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-foreground">
              <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> {course.estimatedHours} hours</div>
              <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> {course.modulesCount} modules</div>
              <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {course.enrolledCount} enrolled</div>
              {course.rating && (
                <div className="flex items-center gap-2 text-amber-400"><Star className="h-5 w-5 fill-current" /> {course.rating.toFixed(1)}</div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-80 shrink-0 bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground mb-1">Instructor</div>
              <div className="font-bold text-lg">{course.instructorName}</div>
            </div>
            <Button 
              size="lg" 
              className="w-full h-14 text-lg rounded-xl"
              onClick={handleAction}
              isLoading={enrollMutation.isPending}
            >
              {course.isEnrolled ? (
                <><PlayCircle className="mr-2 h-5 w-5" /> Continue Learning</>
              ) : (
                <><CheckCircle className="mr-2 h-5 w-5" /> Enroll Now</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Syllabus */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Course Syllabus
        </h2>
        
        <div className="space-y-4">
          {course.modules?.map((module, idx) => (
            <Card key={module.id} className="border-border bg-card/50 overflow-hidden hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{module.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{module.description}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-primary">
                      <FileCheck className="h-4 w-4" /> {module.lessonsCount} Interactive Lessons
                    </div>
                  </div>
                  {course.isEnrolled && (
                    <Link href={`/modules/${module.id}/lessons`}>
                      <Button variant="outline" size="sm">Start</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Temporary import fix for icon used above
import { FileCheck } from 'lucide-react';
