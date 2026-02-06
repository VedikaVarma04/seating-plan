import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, School, ArrowRight } from "lucide-react";
import { db } from "@/lib/mock-db";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (role: "faculty" | "student") => {
    // In a real app, this would be an API call
    // For prototype, we simulate a simple check
    if (username && password) {
      // Mock validation
      if (role === "faculty" && username === "faculty") {
        localStorage.setItem("user_role", "faculty");
        setLocation("/faculty");
        toast({ title: "Welcome back, Professor.", description: "Access granted to administration portal." });
      } else if (role === "student") {
        localStorage.setItem("user_role", "student");
        setLocation("/student");
        toast({ title: "Welcome, Student.", description: "Access granted to exam portal." });
      } else {
        toast({ 
          variant: "destructive",
          title: "Access Denied", 
          description: "Invalid credentials. Try username: 'faculty' or 'student' with any password." 
        });
      }
    } else {
      toast({ 
        variant: "destructive",
        title: "Input Required", 
        description: "Please enter your ID and password." 
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-grid-black/[0.02] flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 w-full h-full bg-background z-0">
        <div className="absolute h-[500px] w-[500px] -top-24 -left-24 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute h-[500px] w-[500px] -bottom-24 -right-24 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md z-10 border-muted/60 shadow-xl">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Exam Seating Portal</CardTitle>
          <CardDescription>
            Select your role to access the seating arrangement system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="faculty">Faculty</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student Roll Number</Label>
                <Input 
                  id="student-id" 
                  placeholder="e.g. CSD-24-001" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-pass">Password</Label>
                <Input 
                  id="student-pass" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => handleLogin("student")}>
                Access Student Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Tip: Use username "student"
              </p>
            </TabsContent>

            <TabsContent value="faculty" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <Label htmlFor="faculty-id">Faculty ID</Label>
                <Input 
                  id="faculty-id" 
                  placeholder="e.g. FAC-001" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-pass">Password</Label>
                <Input 
                  id="faculty-pass" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={() => handleLogin("faculty")}>
                Access Faculty Dashboard <School className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Tip: Use username "faculty"
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
