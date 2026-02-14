import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setAuth, apiFetch } from "@/lib/auth";
import { BRANCHES } from "@shared/schema";

export default function StudentAuthPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Signup state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupRollNo, setSignupRollNo] = useState("");
  const [signupBranch, setSignupBranch] = useState(BRANCHES[0]);

  const handleLogin = async () => {
    if (!loginId || !loginPass) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter your username and password." });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/student/login", {
        method: "POST",
        body: JSON.stringify({ username: loginId, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Login Failed", description: data.message });
        return;
      }
      setAuth(data.token, data.user);
      toast({ title: "Welcome, Student.", description: "Access granted to exam portal." });
      setLocation("/student");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupUsername || !signupPass || !signupName || !signupRollNo) {
      toast({ variant: "destructive", title: "Input Required", description: "Please fill in all fields." });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/student/signup", {
        method: "POST",
        body: JSON.stringify({
          username: signupUsername,
          password: signupPass,
          name: signupName,
          rollNo: signupRollNo,
          branch: signupBranch,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Signup Failed", description: data.message });
        return;
      }
      setAuth(data.token, data.user);
      toast({ title: "Account Created", description: "Welcome to the exam portal." });
      setLocation("/student");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-background z-0">
        <div className="absolute h-[500px] w-[500px] -top-24 -left-24 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute h-[500px] w-[500px] -bottom-24 -right-24 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md z-10 border-muted/60 shadow-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <Link href="/">
            <button className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </Link>
          <div className="mx-auto bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
            <GraduationCap className="h-8 w-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Student Portal</CardTitle>
          <CardDescription>
            Login or create a new student account to view your exam seating.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stu-login-id">Username</Label>
                <Input
                  id="stu-login-id"
                  placeholder="Enter your username"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stu-login-pass">Password</Label>
                <Input
                  id="stu-login-pass"
                  type="password"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Default: username "student", password "password"
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stu-signup-name">Full Name</Label>
                <Input
                  id="stu-signup-name"
                  placeholder="e.g. John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stu-signup-username">Username</Label>
                <Input
                  id="stu-signup-username"
                  placeholder="Choose a username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stu-signup-roll">Roll Number</Label>
                <Input
                  id="stu-signup-roll"
                  placeholder="e.g. CSD-24-001"
                  className="font-mono uppercase"
                  value={signupRollNo}
                  onChange={(e) => setSignupRollNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select onValueChange={(v: any) => setSignupBranch(v)} defaultValue={signupBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stu-signup-pass">Password</Label>
                <Input
                  id="stu-signup-pass"
                  type="password"
                  placeholder="Min 4 characters"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating Account..." : "Create Student Account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
