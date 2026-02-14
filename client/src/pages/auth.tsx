import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, School, ArrowRight } from "lucide-react";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useEffect } from "react";

export default function AuthPage() {
  const [_, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === "faculty") setLocation("/faculty");
      else if (role === "student") setLocation("/student");
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 w-full h-full bg-background z-0">
        <div className="absolute h-[500px] w-[500px] -top-24 -left-24 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute h-[500px] w-[500px] -bottom-24 -right-24 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Seating Portal</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select your role to access the seating arrangement system. Faculty can manage seating, students can view their assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Faculty Card */}
          <Card
            className="hover:border-primary/50 transition-all cursor-pointer group hover:shadow-lg"
            onClick={() => setLocation("/auth/faculty")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <School className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Faculty</CardTitle>
              <CardDescription>
                Manage exam sessions, upload seating arrangements, and assign students to seats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-primary transition-colors" variant="outline">
                Continue as Faculty <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card
            className="hover:border-blue-500/50 transition-all cursor-pointer group hover:shadow-lg"
            onClick={() => setLocation("/auth/student")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-blue-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                <GraduationCap className="h-7 w-7 text-blue-500" />
              </div>
              <CardTitle className="text-xl">Student</CardTitle>
              <CardDescription>
                View your exam seating arrangement, find your classroom and seat number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full group-hover:bg-blue-500 group-hover:text-white transition-colors" variant="outline">
                Continue as Student <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
