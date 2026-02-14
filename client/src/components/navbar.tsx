import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { clearAuth, getUser, apiFetch } from "@/lib/auth";

export function Navbar({ role }: { role?: "faculty" | "student" }) {
  const [_, setLocation] = useLocation();
  const user = getUser();

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    clearAuth();
    setLocation("/");
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={role === "faculty" ? "/faculty" : "/student"}>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight">ExamSeater</span>
              <span className="text-xs text-muted-foreground font-mono">INSTITUTE PORTAL</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {role && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden md:inline-block px-3 py-1 bg-secondary rounded-full">
                {role === "faculty" ? "Faculty Access" : "Student Portal"}
                {user?.name && ` • ${user.name}`}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
