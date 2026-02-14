import {
  type User,
  type InsertUser,
  type ExamSession,
  type CreateSession,
  type Seat,
} from "@shared/schema";
import crypto from "crypto";
const randomUUID = () => crypto.randomUUID();

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string, role: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Sessions
  getSessions(): Promise<ExamSession[]>;
  getSessionsByFaculty(facultyId: string): Promise<ExamSession[]>;
  getSession(id: string): Promise<ExamSession | undefined>;
  createSession(data: CreateSession, facultyId: string): Promise<ExamSession>;
  deleteSession(id: string): Promise<boolean>;

  // Seats
  updateSeat(
    sessionId: string,
    seatId: string,
    rollNo: string,
    studentName?: string
  ): Promise<boolean>;
  bulkUpdateSeats(
    sessionId: string,
    updates: { row: number; col: number; rollNo: string; studentName?: string }[]
  ): Promise<number>;
  findStudentSeat(
    rollNo: string
  ): Promise<{ session: ExamSession; seat: Seat } | undefined>;
  findAllStudentSeats(
    rollNo: string
  ): Promise<{ session: ExamSession; seat: Seat }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, ExamSession>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.seedData();
  }

  private seedData() {
    // Create a default faculty user
    const facultyId = randomUUID();
    this.users.set(facultyId, {
      id: facultyId,
      username: "faculty",
      password: "password",
      role: "faculty",
      name: "Dr. Admin",
    });

    // Create a default student user
    const studentId = randomUUID();
    this.users.set(studentId, {
      id: studentId,
      username: "student",
      password: "password",
      role: "student",
      name: "John Doe",
      rollNo: "CSD-001",
      branch: "COMPUTER SCIENCE AND DESIGN",
    });

    // Create sample sessions
    this.createSession(
      {
        branch: "COMPUTER SCIENCE AND DESIGN",
        subject: "Data Structures",
        date: "2024-05-10",
        time: "10:00",
        room: "Hall 101",
        rows: 8,
        cols: 6,
      },
      facultyId
    );

    this.createSession(
      {
        branch: "CIVIL",
        subject: "Structural Engineering",
        date: "2024-05-12",
        time: "14:00",
        room: "Hall 202",
        rows: 8,
        cols: 6,
      },
      facultyId
    );
  }

  // ---- Users ----
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(
    username: string,
    role: string
  ): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username && user.role === role
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ---- Sessions ----
  async getSessions(): Promise<ExamSession[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionsByFaculty(facultyId: string): Promise<ExamSession[]> {
    return Array.from(this.sessions.values()).filter(
      (s) => s.createdBy === facultyId
    );
  }

  async getSession(id: string): Promise<ExamSession | undefined> {
    return this.sessions.get(id);
  }

  async createSession(
    data: CreateSession,
    facultyId: string
  ): Promise<ExamSession> {
    const id = randomUUID();
    const seats: Seat[] = [];

    for (let r = 0; r < data.rows; r++) {
      for (let c = 0; c < data.cols; c++) {
        seats.push({
          id: `${id}-r${r}-c${c}`,
          row: r,
          col: c,
        });
      }
    }

    const session: ExamSession = {
      id,
      subject: data.subject,
      date: data.date,
      time: data.time,
      branch: data.branch,
      room: data.room,
      rows: data.rows,
      cols: data.cols,
      seats,
      createdBy: facultyId,
    };

    this.sessions.set(id, session);
    return session;
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  // ---- Seats ----
  async updateSeat(
    sessionId: string,
    seatId: string,
    rollNo: string,
    studentName?: string
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const seat = session.seats.find((s) => s.id === seatId);
    if (!seat) return false;

    seat.studentRollNo = rollNo || undefined;
    seat.studentName = studentName || undefined;
    return true;
  }

  async bulkUpdateSeats(
    sessionId: string,
    updates: { row: number; col: number; rollNo: string; studentName?: string }[]
  ): Promise<number> {
    const session = this.sessions.get(sessionId);
    if (!session) return 0;

    let count = 0;
    for (const update of updates) {
      const seat = session.seats.find(
        (s) => s.row === update.row && s.col === update.col
      );
      if (seat) {
        seat.studentRollNo = update.rollNo || undefined;
        seat.studentName = update.studentName || undefined;
        count++;
      }
    }
    return count;
  }

  async findStudentSeat(
    rollNo: string
  ): Promise<{ session: ExamSession; seat: Seat } | undefined> {
    const allSessions = Array.from(this.sessions.values());
    for (const session of allSessions) {
      const seat = session.seats.find(
        (s: Seat) => s.studentRollNo?.toUpperCase() === rollNo.toUpperCase()
      );
      if (seat) return { session, seat };
    }
    return undefined;
  }

  async findAllStudentSeats(
    rollNo: string
  ): Promise<{ session: ExamSession; seat: Seat }[]> {
    const results: { session: ExamSession; seat: Seat }[] = [];
    const allSessions = Array.from(this.sessions.values());
    for (const session of allSessions) {
      const seat = session.seats.find(
        (s: Seat) => s.studentRollNo?.toUpperCase() === rollNo.toUpperCase()
      );
      if (seat) results.push({ session, seat });
    }
    return results;
  }
}

export const storage = new MemStorage();
