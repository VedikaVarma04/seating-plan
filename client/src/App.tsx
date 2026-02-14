import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import FacultyAuthPage from "@/pages/auth-faculty";
import StudentAuthPage from "@/pages/auth-student";
import FacultyDashboard from "@/pages/dashboard-faculty";
import StudentDashboard from "@/pages/dashboard-student";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/auth/faculty" component={FacultyAuthPage} />
      <Route path="/auth/student" component={StudentAuthPage} />
      <Route path="/faculty" component={FacultyDashboard} />
      <Route path="/student" component={StudentDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
