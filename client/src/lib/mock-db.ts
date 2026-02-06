
export type Branch = 
  | "COMPUTER SCIENCE AND DESIGN"
  | "ARTIFICAL INTELLIGENCE AND DATA SCIENCE"
  | "CIVIL"
  | "MECHANICS"
  | "MECHANTRONICS"
  | "COMPUTER ENGINEERING";

export const BRANCHES: Branch[] = [
  "COMPUTER SCIENCE AND DESIGN",
  "ARTIFICAL INTELLIGENCE AND DATA SCIENCE",
  "CIVIL",
  "MECHANICS",
  "MECHANTRONICS",
  "COMPUTER ENGINEERING"
];

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  branch: Branch;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  studentId?: string; // If null, seat is empty
}

export interface ExamSession {
  id: string;
  subject: string;
  date: string;
  time: string;
  branch: Branch;
  seats: Seat[];
}

// Mock Database
class MockDB {
  private sessions: ExamSession[] = [];
  private users = [
    { username: "faculty", password: "password", role: "faculty", name: "Dr. Admin" },
    { username: "student", password: "password", role: "student", name: "John Doe", rollNo: "CSD-001" }
  ];

  constructor() {
    // Initialize with some dummy data
    this.createSession("COMPUTER SCIENCE AND DESIGN", "Data Structures", "2024-05-10", "10:00 AM");
    this.createSession("CIVIL", "Structural Engineering", "2024-05-12", "02:00 PM");
  }

  login(username: string, role: "faculty" | "student") {
    return this.users.find(u => u.username === username && u.role === role);
  }

  getSessions() {
    return this.sessions;
  }

  getSession(id: string) {
    return this.sessions.find(s => s.id === id);
  }

  createSession(branch: Branch, subject: string, date: string, time: string) {
    const id = Math.random().toString(36).substring(7);
    const seats: Seat[] = [];
    
    // Initialize 8x6 grid
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 6; c++) {
        seats.push({
          id: `${id}-r${r}-c${c}`,
          row: r,
          col: c,
          studentId: undefined
        });
      }
    }

    const newSession: ExamSession = { id, branch, subject, date, time, seats };
    this.sessions.push(newSession);
    return newSession;
  }

  updateSeat(sessionId: string, seatId: string, rollNo: string) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const seat = session.seats.find(s => s.id === seatId);
    if (seat) {
      seat.studentId = rollNo || undefined;
    }
  }
}

export const db = new MockDB();
