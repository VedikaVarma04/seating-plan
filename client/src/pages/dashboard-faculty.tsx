import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BRANCHES, Branch, db, ExamSession } from "@/lib/mock-db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Clock, MapPin } from "lucide-react";
import { SeatingGrid } from "@/components/seating-grid";
import { useToast } from "@/hooks/use-toast";

export default function FacultyDashboard() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ExamSession[]>(db.getSessions());
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState<{seatId: string, currentRoll: string} | null>(null);
  
  // New Session Form State
  const [newBranch, setNewBranch] = useState<Branch>(BRANCHES[0]);
  const [newSubject, setNewSubject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleCreateSession = () => {
    if (!newSubject || !newDate || !newTime) {
      toast({ title: "Missing Information", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const session = db.createSession(newBranch, newSubject, newDate, newTime);
    setSessions([...db.getSessions()]);
    setIsCreateOpen(false);
    toast({ title: "Session Created", description: `${newSubject} exam session has been created.` });
  };

  const handleSeatClick = (seat: any) => {
    setEditingSeat({ seatId: seat.id, currentRoll: seat.studentId || "" });
  };

  const saveSeatAssignment = () => {
    if (selectedSession && editingSeat) {
      db.updateSeat(selectedSession.id, editingSeat.seatId, editingSeat.currentRoll);
      // Force update local state
      const updated = db.getSession(selectedSession.id);
      if (updated) setSelectedSession({...updated});
      setEditingSeat(null);
      toast({ title: "Seat Updated", description: "The seating arrangement has been modified." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar role="faculty" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage exam sessions and seating arrangements.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Exam Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Exam Session</DialogTitle>
                <DialogDescription>
                  Set up a new examination seating plan for a specific branch.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select onValueChange={(v) => setNewBranch(v as Branch)} defaultValue={newBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Advanced Algorithms" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSession}>Create Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!selectedSession ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <Card key={session.id} className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setSelectedSession(session)}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-2">
                    <span className="text-lg leading-tight group-hover:text-primary transition-colors">{session.subject}</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground whitespace-nowrap">ID: {session.id}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-1">{session.branch}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> {session.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> {session.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Room 101 (50 Capacity)
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {session.seats.filter(s => s.studentId).length} Seats Assigned
                  </div>
                </CardContent>
              </Card>
            ))}
            {sessions.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                No exam sessions found. Create one to get started.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)}>
                ← Back to Dashboard
              </Button>
              <div>
                <h2 className="text-xl font-bold">{selectedSession.subject}</h2>
                <p className="text-sm text-muted-foreground">{selectedSession.branch} • {selectedSession.date} at {selectedSession.time}</p>
              </div>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">Classroom Layout Editor</h3>
                  <p className="text-xs text-muted-foreground">Click on a seat to assign or remove a student roll number.</p>
                </div>
                
                <SeatingGrid 
                  seats={selectedSession.seats} 
                  onSeatClick={handleSeatClick}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Seat Editor Dialog */}
      <Dialog open={!!editingSeat} onOpenChange={(open) => !open && setEditingSeat(null)}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Assign Seat</DialogTitle>
            <DialogDescription>
              Enter student roll number for this seat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input 
                id="rollNo" 
                value={editingSeat?.currentRoll || ""} 
                onChange={(e) => setEditingSeat(prev => prev ? {...prev, currentRoll: e.target.value} : null)}
                placeholder="e.g. CSD-001"
                className="font-mono uppercase"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="outline" onClick={() => setEditingSeat(prev => prev ? {...prev, currentRoll: ""} : null)}>Clear</Button>
             <Button onClick={saveSeatAssignment}>Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
