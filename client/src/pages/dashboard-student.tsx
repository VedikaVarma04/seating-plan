import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { db, ExamSession } from "@/lib/mock-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { SeatingGrid } from "@/components/seating-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentDashboard() {
  const [searchRoll, setSearchRoll] = useState("");
  const [foundSession, setFoundSession] = useState<ExamSession | null>(null);
  const [allSessions] = useState(db.getSessions());

  const handleSearch = () => {
    // Find a session where this student has a seat
    const roll = searchRoll.trim();
    if (!roll) return;

    // Simple search: find first session where this roll number exists
    const session = allSessions.find(s => s.seats.some(seat => seat.studentId === roll));
    setFoundSession(session || null);
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </div>

        {foundSession ? (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Card className="border-primary/20 shadow-lg overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{foundSession.subject}</CardTitle>
                      <p className="text-muted-foreground mt-1">{foundSession.branch}</p>
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
                      <p className="text-muted-foreground">{foundSession.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">{foundSession.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm p-3 bg-secondary/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Room</p>
                      <p className="text-muted-foreground">Hall 101</p>
                    </div>
                  </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                  <CardTitle className="text-base">Seating Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <SeatingGrid 
                    seats={foundSession.seats} 
                    readOnly={true} 
                    highlightRollNo={searchRoll}
                  />
                </CardContent>
             </Card>
           </div>
        ) : searchRoll && (
          <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Found</AlertTitle>
              <AlertDescription>
                No seating arrangement found for roll number <strong>{searchRoll}</strong>. Please check the number or contact faculty.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!searchRoll && !foundSession && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12 opacity-50 pointer-events-none grayscale">
             {/* Placeholder UI to fill space nicely */}
             {[1,2,3].map(i => (
               <div key={i} className="h-32 bg-muted rounded-xl border-2 border-dashed border-muted-foreground/20" />
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
