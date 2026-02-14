import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  facultySignupSchema,
  studentSignupSchema,
  createSessionSchema,
} from "@shared/schema";
import multer from "multer";
import * as XLSX from "xlsx";

const upload = multer({ storage: multer.memoryStorage() });

// Simple session tracking via a token map (in-memory)
const tokenMap = new Map<string, { userId: string; role: string }>();

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function authMiddleware(role?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token || !tokenMap.has(token)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const session = tokenMap.get(token)!;
    if (role && session.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    (req as any).userId = session.userId;
    (req as any).userRole = session.role;
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============ AUTH ROUTES ============

  // Faculty signup
  app.post("/api/auth/faculty/signup", async (req: Request, res: Response) => {
    try {
      const data = facultySignupSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username, "faculty");
      if (existing) {
        res.status(400).json({ message: "Faculty ID already exists" });
        return;
      }
      const user = await storage.createUser({
        ...data,
        role: "faculty",
      });
      const token = generateToken();
      tokenMap.set(token, { userId: user.id, role: "faculty" });
      res.json({
        token,
        user: { id: user.id, name: user.name, role: "faculty", username: user.username },
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid data" });
    }
  });

  // Faculty login
  app.post("/api/auth/faculty/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username, "faculty");
      if (!user || user.password !== data.password) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const token = generateToken();
      tokenMap.set(token, { userId: user.id, role: "faculty" });
      res.json({
        token,
        user: { id: user.id, name: user.name, role: "faculty", username: user.username },
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid data" });
    }
  });

  // Student signup
  app.post("/api/auth/student/signup", async (req: Request, res: Response) => {
    try {
      const data = studentSignupSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username, "student");
      if (existing) {
        res.status(400).json({ message: "Username already exists" });
        return;
      }
      const user = await storage.createUser({
        ...data,
        role: "student",
      });
      const token = generateToken();
      tokenMap.set(token, { userId: user.id, role: "student" });
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: "student",
          username: user.username,
          rollNo: user.rollNo,
          branch: user.branch,
        },
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid data" });
    }
  });

  // Student login
  app.post("/api/auth/student/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username, "student");
      if (!user || user.password !== data.password) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }
      const token = generateToken();
      tokenMap.set(token, { userId: user.id, role: "student" });
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: "student",
          username: user.username,
          rollNo: user.rollNo,
          branch: user.branch,
        },
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Invalid data" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authMiddleware(), async (req: Request, res: Response) => {
    const user = await storage.getUser((req as any).userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) tokenMap.delete(token);
    res.json({ message: "Logged out" });
  });

  // ============ SESSION ROUTES (Faculty) ============

  // Get all sessions (faculty sees their own)
  app.get(
    "/api/sessions",
    authMiddleware(),
    async (req: Request, res: Response) => {
      const role = (req as any).userRole;
      let sessions;
      if (role === "faculty") {
        sessions = await storage.getSessionsByFaculty((req as any).userId);
      } else {
        sessions = await storage.getSessions();
      }
      res.json(sessions);
    }
  );

  // Get single session
  app.get(
    "/api/sessions/:id",
    authMiddleware(),
    async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const session = await storage.getSession(id);
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      res.json(session);
    }
  );

  // Create session (faculty only)
  app.post(
    "/api/sessions",
    authMiddleware("faculty"),
    async (req: Request, res: Response) => {
      try {
        const data = createSessionSchema.parse(req.body);
        const session = await storage.createSession(data, (req as any).userId);
        res.json(session);
      } catch (err: any) {
        res.status(400).json({ message: err.message || "Invalid data" });
      }
    }
  );

  // Delete session (faculty only)
  app.delete(
    "/api/sessions/:id",
    authMiddleware("faculty"),
    async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const deleted = await storage.deleteSession(id);
      if (!deleted) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      res.json({ message: "Deleted" });
    }
  );

  // ============ SEAT ROUTES ============

  // Update single seat
  app.put(
    "/api/sessions/:sessionId/seats/:seatId",
    authMiddleware("faculty"),
    async (req: Request, res: Response) => {
      const sessionId = req.params.sessionId as string;
      const seatId = req.params.seatId as string;
      const { rollNo, studentName } = req.body;
      const updated = await storage.updateSeat(
        sessionId,
        seatId,
        rollNo || "",
        studentName
      );
      if (!updated) {
        res.status(404).json({ message: "Seat not found" });
        return;
      }
      const session = await storage.getSession(sessionId);
      res.json(session);
    }
  );

  // Upload Excel file to populate seats
  app.post(
    "/api/sessions/:sessionId/upload",
    authMiddleware("faculty"),
    upload.single("file"),
    async (req: Request, res: Response) => {
      try {
        const sessionId = req.params.sessionId as string;
        const file = (req as any).file;
        if (!file) {
          res.status(400).json({ message: "No file uploaded" });
          return;
        }

        const session = await storage.getSession(sessionId);
        if (!session) {
          res.status(404).json({ message: "Session not found" });
          return;
        }

        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        const updates: { row: number; col: number; rollNo: string; studentName?: string }[] = [];

        json.forEach((row: any[], index: number) => {
          // Skip header row if it contains non-numeric first cell
          if (index === 0 && isNaN(Number(row[0]))) return;

          const r = parseInt(row[0]) - 1; // 1-based to 0-based
          const c = parseInt(row[1]) - 1;
          const rollNo = String(row[2] || "").trim();
          const studentName = row[3] ? String(row[3]).trim() : undefined;

          if (!isNaN(r) && !isNaN(c) && rollNo) {
            updates.push({ row: r, col: c, rollNo, studentName });
          }
        });

        const count = await storage.bulkUpdateSeats(sessionId, updates);
        const updatedSession = await storage.getSession(sessionId);

        res.json({
          message: `Successfully updated ${count} seats`,
          session: updatedSession,
        });
      } catch (err: any) {
        res.status(400).json({
          message: "Failed to process file: " + (err.message || "Unknown error"),
        });
      }
    }
  );

  // ============ STUDENT SEARCH ============

  // Search for student's seat by roll number
  app.get("/api/student/search", async (req: Request, res: Response) => {
    const rollNo = req.query.rollNo as string;
    if (!rollNo) {
      res.status(400).json({ message: "Roll number is required" });
      return;
    }

    const results = await storage.findAllStudentSeats(rollNo.trim());
    if (results.length === 0) {
      res.status(404).json({ message: "No seating found for this roll number" });
      return;
    }

    res.json(
      results.map((r) => ({
        session: {
          id: r.session.id,
          subject: r.session.subject,
          date: r.session.date,
          time: r.session.time,
          branch: r.session.branch,
          room: r.session.room,
          rows: r.session.rows,
          cols: r.session.cols,
          seats: r.session.seats,
        },
        seat: r.seat,
      }))
    );
  });

  return httpServer;
}
