import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import type { ExamSession, Seat } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { SeatingGrid } from "@/components/seating-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isAuthenticated, getUserRole, getUser, apiFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  session: ExamSession;
  seat: Seat;
}

export default function StudentDashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchRoll, setSearchRoll] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== "student") {
      setLocation("/auth/student");
      return;
    }
    // Auto-fill roll number from user profile
    const user = getUser();
    if (user?.rollNo) {
      setSearchRoll(user.rollNo);
    }
  }, []);

  const handleSearch = async () => {
    const roll = searchRoll.trim();
    if (!roll) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await apiFetch(`/api/student/search?rollNo=${encodeURIComponent(roll)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to search. Please try again." });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="student" />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Find Your Seat</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your roll number below to view your exam seating arrangement for upcoming examinations.
          </p>

          <div className="flex max-w-md mx-auto gap-2 mt-6">
            <Input
              placeholder="Enter Roll Number (e.g. CSD-001)"
              className="font-mono uppercase"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" /> {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {results.map((result, idx) => (
              <div key={idx} className="space-y-6">
                <Card className="border-primary/20 shadow-lg overflow-hidden">
                  <div className="h-2 bg-primary w-full" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{result.session.subject}</CardTitle>
                        <p className="text-muted-foreground mt-1">{result.session.branch}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-mono">
                          {searchRoll.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-3">
                    <div className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-muted-foreground">{result.session.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-muted-foreground">{result.session.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Room</p>
                        <p className="text-muted-foreground">{result.session.room}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Seating Chart — Your seat is highlighted</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SeatingGrid
                      seats={result.session.seats}
                      rows={result.session.rows}
                      cols={result.session.cols}
                      readOnly={true}
                      highlightRollNo={searchRoll}
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : searched && !loading ? (
          <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Found</AlertTitle>
              <AlertDescription>
                No seating arrangement found for roll number <strong>{searchRoll}</strong>. Please check the number or contact faculty.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {!searched && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12 opacity-50 pointer-events-none grayscale">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl border-2 border-dashed border-muted-foreground/20" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
