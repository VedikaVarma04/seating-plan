import { z } from "zod";

// User roles
export type UserRole = "faculty" | "student";

// Branch types
export const BRANCHES = [
  "COMPUTER SCIENCE AND DESIGN",
  "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
  "CIVIL",
  "MECHANICS",
  "MECHATRONICS",
  "COMPUTER ENGINEERING",
] as const;

export type Branch = (typeof BRANCHES)[number];

// ---- User ----
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  rollNo?: string; // only for students
  branch?: Branch; // only for students
}

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["faculty", "student"]),
  name: z.string().min(1, "Name is required"),
  rollNo: z.string().optional(),
  branch: z.enum(BRANCHES).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// ---- Seat ----
export interface Seat {
  id: string;
  row: number;
  col: number;
  studentRollNo?: string;
  studentName?: string;
}

// ---- Exam Session ----
export interface ExamSession {
  id: string;
  subject: string;
  date: string;
  time: string;
  branch: Branch;
  room: string;
  rows: number;
  cols: number;
  seats: Seat[];
  createdBy: string; // faculty user id
}

export const createSessionSchema = z.object({
  subject: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  branch: z.enum(BRANCHES),
  room: z.string().min(1),
  rows: z.number().int().min(1).max(20).default(8),
  cols: z.number().int().min(1).max(12).default(6),
});

export type CreateSession = z.infer<typeof createSessionSchema>;

// ---- Auth schemas ----
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const facultySignupSchema = z.object({
  username: z.string().min(1, "Faculty ID is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Name is required"),
});

export const studentSignupSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Name is required"),
  rollNo: z.string().min(1, "Roll number is required"),
  branch: z.enum(BRANCHES),
});
