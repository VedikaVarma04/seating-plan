import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { BRANCHES } from "@shared/schema";
import type { ExamSession, Seat, Branch } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Calendar, Clock, MapPin, Upload, FileSpreadsheet, Trash2 } from "lucide-react";
import { SeatingGrid } from "@/components/seating-grid";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getUserRole, apiFetch } from "@/lib/auth";

export default function FacultyDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSeat, setEditingSeat] = useState<{ seatId: string; currentRoll: string; currentName: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== "faculty") {
      setLocation("/auth/faculty");
      return;
    }
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load sessions." });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSession) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch(`/api/sessions/${selectedSession.id}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setSelectedSession(data.session);
        toast({ title: "Import Successful", description: data.message });
      } else {
        toast({ variant: "destructive", title: "Import Failed", description: data.message });
      }
    } catch {
      toast({ variant: "destructive", title: "Import Failed", description: "Could not process the file." });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  // New Session Form State
  const [newBranch, setNewBranch] = useState<Branch>(BRANCHES[0]);
  const [newSubject, setNewSubject] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newRoom, setNewRoom] = useState("Hall 101");
  const [newRows, setNewRows] = useState(8);
  const [newCols, setNewCols] = useState(6);

  const handleCreateSession = async () => {
    if (!newSubject || !newDate || !newTime || !newRoom) {
      toast({ title: "Missing Information", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    try {
      const res = await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          subject: newSubject,
          date: newDate,
          time: newTime,
          branch: newBranch,
          room: newRoom,
          rows: newRows,
          cols: newCols,
        }),
      });
      if (res.ok) {
        await fetchSessions();
        setIsCreateOpen(false);
        setNewSubject("");
        setNewDate("");
        setNewTime("");
        setNewRoom("Hall 101");
        toast({ title: "Session Created", description: `${newSubject} exam session has been created.` });
      } else {
        const data = await res.json();
        toast({ variant: "destructive", title: "Error", description: data.message });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to create session." });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await apiFetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast({ title: "Session Deleted" });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete session." });
    }
  };

  const handleSeatClick = (seat: Seat) => {
    setEditingSeat({
      seatId: seat.id,
      currentRoll: seat.studentRollNo || "",
      currentName: seat.studentName || "",
    });
  };

  const saveSeatAssignment = async () => {
    if (selectedSession && editingSeat) {
      try {
        const res = await apiFetch(
          `/api/sessions/${selectedSession.id}/seats/${editingSeat.seatId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              rollNo: editingSeat.currentRoll,
              studentName: editingSeat.currentName,
            }),
          }
        );
        if (res.ok) {
          const updatedSession = await res.json();
          setSelectedSession(updatedSession);
          setEditingSeat(null);
          toast({ title: "Seat Updated", description: "The seating arrangement has been modified." });
        }
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Failed to update seat." });
      }
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
                  <Select onValueChange={(v: any) => setNewBranch(v)} defaultValue={newBranch}>
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
                  <Label>Subject</Label>
                  <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="e.g. Advanced Algorithms" />
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="e.g. Hall 101" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rows</Label>
                    <Input type="number" min={1} max={20} value={newRows} onChange={(e) => setNewRows(parseInt(e.target.value) || 8)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Columns</Label>
                    <Input type="number" min={1} max={12} value={newCols} onChange={(e) => setNewCols(parseInt(e.target.value) || 6)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSession}>Create Session</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
        ) : !selectedSession ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="hover:border-primary/50 transition-colors cursor-pointer group relative"
                onClick={() => setSelectedSession(session)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-2">
                    <span className="text-lg leading-tight group-hover:text-primary transition-colors">{session.subject}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                      <MapPin className="h-4 w-4" /> {session.room} ({session.rows * session.cols} Capacity)
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {session.seats.filter((s) => s.studentRollNo).length} Seats Assigned
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
              <Button variant="outline" size="sm" onClick={() => { setSelectedSession(null); fetchSessions(); }}>
                ← Back to Dashboard
              </Button>
              <div>
                <h2 className="text-xl font-bold">{selectedSession.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedSession.branch} • {selectedSession.date} at {selectedSession.time} • {selectedSession.room}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-primary/20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Spreadsheet Import</p>
                  <p className="text-xs text-muted-foreground">Upload .xlsx or .csv (Row, Col, RollNo, Name)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="excel-upload"
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button variant="outline" size="sm" asChild disabled={isUploading} className="cursor-pointer">
                  <label htmlFor="excel-upload">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Processing..." : "Upload Seating List"}
                  </label>
                </Button>
              </div>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Classroom Layout Editor
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Click on a seat to assign or remove a student roll number.
                  </p>
                </div>

                <SeatingGrid
                  seats={selectedSession.seats}
                  rows={selectedSession.rows}
                  cols={selectedSession.cols}
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
            <DialogDescription>Enter student details for this seat.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rollNo">Roll Number</Label>
              <Input
                id="rollNo"
                value={editingSeat?.currentRoll || ""}
                onChange={(e) => setEditingSeat((prev) => (prev ? { ...prev, currentRoll: e.target.value } : null))}
                placeholder="e.g. CSD-001"
                className="font-mono uppercase"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name (optional)</Label>
              <Input
                id="studentName"
                value={editingSeat?.currentName || ""}
                onChange={(e) => setEditingSeat((prev) => (prev ? { ...prev, currentName: e.target.value } : null))}
                placeholder="e.g. John Doe"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingSeat((prev) => (prev ? { ...prev, currentRoll: "", currentName: "" } : null))}
            >
              Clear
            </Button>
            <Button onClick={saveSeatAssignment}>Save Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
