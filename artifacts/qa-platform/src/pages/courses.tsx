import React, { useState } from 'react';
import { useGetCourses } from '@workspace/api-client-react';
import { Card, CardContent, PageLoader, Badge, Button, Input, Select } from '@/components/ui';
import { Search, Clock, Users, BookOpen, Filter } from 'lucide-react';
import { Link } from 'wouter';
import { getDifficultyColor } from '@/lib/utils';

export default function Courses() {
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [search, setSearch] = useState('');

  const { data: courses, isLoading } = useGetCourses({
    category: category || undefined,
    difficulty: difficulty || undefined
  });

  const filteredCourses = courses?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Course Catalog</h1>
        <p className="text-muted-foreground">Master software testing through interactive, hands-on modules.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            className="pl-9 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 flex-1 md:w-48">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="border-0 focus-visible:ring-0 px-0 h-10 w-full bg-transparent"
            >
              <option value="">All Categories</option>
              <option value="manual-testing">Manual Testing</option>
              <option value="automation-testing">Automation</option>
              <option value="api-testing">API Testing</option>
            </Select>
          </div>
          <Select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full md:w-40"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="interactive-card h-full flex flex-col cursor-pointer group">
                <div className="relative h-48 bg-secondary overflow-hidden">
                  <img 
                    src={course.imageUrl || `${import.meta.env.BASE_URL}images/course-placeholder.png`}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <Badge className={getDifficultyColor(course.difficulty)}>{course.difficulty}</Badge>
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-white/10">{course.category}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h2>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedHours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.modulesCount} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolledCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filteredCourses?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
