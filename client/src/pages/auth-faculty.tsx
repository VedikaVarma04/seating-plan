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
import { School, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setAuth, apiFetch } from "@/lib/auth";

export default function FacultyAuthPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Signup state
  const [signupId, setSignupId] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [signupName, setSignupName] = useState("");

  const handleLogin = async () => {
    if (!loginId || !loginPass) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter your Faculty ID and password." });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/faculty/login", {
        method: "POST",
        body: JSON.stringify({ username: loginId, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Login Failed", description: data.message });
        return;
      }
      setAuth(data.token, data.user);
      toast({ title: "Welcome back, Professor.", description: "Access granted to administration portal." });
      setLocation("/faculty");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupId || !signupPass || !signupName) {
      toast({ variant: "destructive", title: "Input Required", description: "Please fill in all fields." });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/faculty/signup", {
        method: "POST",
        body: JSON.stringify({ username: signupId, password: signupPass, name: signupName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Signup Failed", description: data.message });
        return;
      }
      setAuth(data.token, data.user);
      toast({ title: "Account Created", description: "Welcome to the administration portal." });
      setLocation("/faculty");
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-background z-0">
        <div className="absolute h-[500px] w-[500px] -top-24 -left-24 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute h-[500px] w-[500px] -bottom-24 -right-24 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md z-10 border-muted/60 shadow-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <Link href="/">
            <button className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          </Link>
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <School className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Faculty Portal</CardTitle>
          <CardDescription>
            Login or create a new faculty account to manage exam seating.
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
                <Label htmlFor="fac-login-id">Faculty ID</Label>
                <Input
                  id="fac-login-id"
                  placeholder="e.g. FAC-001"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fac-login-pass">Password</Label>
                <Input
                  id="fac-login-pass"
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
                Default: username "faculty", password "password"
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fac-signup-name">Full Name</Label>
                <Input
                  id="fac-signup-name"
                  placeholder="e.g. Dr. Smith"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fac-signup-id">Faculty ID</Label>
                <Input
                  id="fac-signup-id"
                  placeholder="e.g. FAC-002"
                  value={signupId}
                  onChange={(e) => setSignupId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fac-signup-pass">Password</Label>
                <Input
                  id="fac-signup-pass"
                  type="password"
                  placeholder="Min 4 characters"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating Account..." : "Create Faculty Account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
