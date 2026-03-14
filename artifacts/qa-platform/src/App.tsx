import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Contexts & Layouts
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/layout";

// Pages
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import Lesson from "@/pages/lesson";
import Exercise from "@/pages/exercise";
import BugTracker from "@/pages/bug-tracker";
import TestCases from "@/pages/test-cases";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      
      {/* Publicly visible but with navigation */}
      <Route path="/courses">
        <ProtectedRoute><Courses /></ProtectedRoute>
      </Route>
      <Route path="/courses/:id">
        <ProtectedRoute><CourseDetail /></ProtectedRoute>
      </Route>

      {/* Protected Routes inside App Shell */}
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/lessons/:id">
        <ProtectedRoute><Lesson /></ProtectedRoute>
      </Route>
      <Route path="/exercises/:id">
        <ProtectedRoute><Exercise /></ProtectedRoute>
      </Route>
      <Route path="/bug-tracker">
        <ProtectedRoute><BugTracker /></ProtectedRoute>
      </Route>
      <Route path="/test-cases">
        <ProtectedRoute><TestCases /></ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute><Leaderboard /></ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            }
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
