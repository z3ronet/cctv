import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { SchoolUser, TrafficLog, ClassroomStatus, SecurityAlert, DashboardStats } from "./src/types"; // inside node, we can import relative file

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to allow base64 images upload (photos)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize Gemini API
const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
let ai: GoogleGenAI | null = null;

if (hasGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI successfully initialized for server-side computer vision proxy.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found or default key used. The system will use intelligent heuristic-simulators for the computer vision webcam analysis.");
}

// --- SEED DATA (IN-MEMORY DATABASE) ---
let users: SchoolUser[] = [
  // Students
  {
    id: "STU-101",
    name: "آرش رضایی",
    role: "student",
    nationalId: "0021458932",
    phone: "09121112233",
    registeredAt: "2026-04-10T08:00:00Z",
    grade: "دهم ریاضی",
    classRoom: "101",
    parentId: "PAR-401",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "STU-102",
    name: "سارا کریمی",
    role: "student",
    nationalId: "0018956421",
    phone: "09122223344",
    registeredAt: "2026-04-12T09:15:00Z",
    grade: "یازدهم تجربی",
    classRoom: "102",
    parentId: "PAR-402",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "STU-103",
    name: "مهران احمدی",
    role: "student",
    nationalId: "0034561234",
    phone: "09123334455",
    registeredAt: "2026-04-15T10:00:00Z",
    grade: "دهم ریاضی",
    classRoom: "101",
    parentId: "PAR-403",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "STU-104",
    name: "مریم حسینی",
    role: "student",
    nationalId: "0025849612",
    phone: "09124445566",
    registeredAt: "2026-04-16T08:30:00Z",
    grade: "دوازدهم انسانی",
    classRoom: "103",
    parentId: "PAR-404",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60"
  },
  // Teachers
  {
    id: "TEA-201",
    name: "دکتر مسعود حمیدی",
    role: "teacher",
    nationalId: "1289452310",
    phone: "09131115566",
    registeredAt: "2025-09-01T07:30:00Z",
    subject: "ریاضی و دیفرانسیل",
    classes: ["101", "103"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "TEA-202",
    name: "خانم مهشید موسوی",
    role: "teacher",
    nationalId: "1298563412",
    phone: "09132225577",
    registeredAt: "2025-09-01T07:45:00Z",
    subject: "شیمی و زیست‌شناسی",
    classes: ["102"],
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60"
  },
  // Staff
  {
    id: "STF-301",
    name: "آقای رضا کاظمی",
    role: "staff",
    nationalId: "0058451296",
    phone: "09129998877",
    registeredAt: "2024-03-10T07:00:00Z",
    position: "ناظم ارشد و مسئول تردد",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "STF-302",
    name: "آقای غلامحسین حسینی",
    role: "staff",
    nationalId: "0065239841",
    phone: "09128887766",
    registeredAt: "2023-11-15T06:30:00Z",
    position: "مسئول حراست و کنترل امنیت",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=60"
  },
  // Parents
  {
    id: "PAR-401",
    name: "علیرضا رضایی",
    role: "parent",
    nationalId: "0045612389",
    phone: "09127776655",
    registeredAt: "2026-04-10T08:00:00Z",
    childId: "STU-101",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=60"
  },
  {
    id: "PAR-402",
    name: "فاطمه کریمی (مادر)",
    role: "parent",
    nationalId: "0031254896",
    phone: "09125554433",
    registeredAt: "2026-04-12T09:15:00Z",
    childId: "STU-102",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=60"
  }
];

// Seed Traffic Logs
let trafficLogs: TrafficLog[] = [
  {
    id: "LOG-001",
    userId: "STF-302",
    userName: "آقای غلامحسین حسینی",
    userRole: "staff",
    timestamp: "2026-07-20T06:45:00Z",
    type: "in",
    status: "normal",
    cameraName: "درب ورودی اصلی"
  },
  {
    id: "LOG-002",
    userId: "STF-301",
    userName: "آقای رضا کاظمی",
    userRole: "staff",
    timestamp: "2026-07-20T07:10:00Z",
    type: "in",
    status: "normal",
    cameraName: "درب ورودی اصلی"
  },
  {
    id: "LOG-003",
    userId: "TEA-201",
    userName: "دکتر مسعود حمیدی",
    userRole: "teacher",
    timestamp: "2026-07-20T07:25:00Z",
    type: "in",
    status: "normal",
    cameraName: "گیت اسکنر اساتید"
  },
  {
    id: "LOG-004",
    userId: "STU-101",
    userName: "آرش رضایی",
    userRole: "student",
    timestamp: "2026-07-20T07:35:00Z",
    type: "in",
    status: "normal",
    cameraName: "گیت اصلی دانش‌آموزان"
  },
  {
    id: "LOG-005",
    userId: "STU-102",
    userName: "سارا کریمی",
    userRole: "student",
    timestamp: "2026-07-20T07:42:00Z",
    type: "in",
    status: "normal",
    cameraName: "گیت اصلی دانش‌آموزان"
  },
  {
    id: "LOG-006",
    userId: "STU-104",
    userName: "مریم حسینی",
    userRole: "student",
    timestamp: "2026-07-20T07:58:00Z",
    type: "in",
    status: "late",
    cameraName: "گیت اصلی دانش‌آموزان"
  },
  {
    id: "LOG-007",
    userId: "TEA-202",
    userName: "خانم مهشید موسوی",
    userRole: "teacher",
    timestamp: "2026-07-20T08:15:00Z",
    type: "in",
    status: "late",
    cameraName: "گیت اسکنر اساتید"
  }
];

// Seed Classroom Monitoring
let classroomStatuses: ClassroomStatus[] = [
  {
    id: "101",
    grade: "دهم ریاضی",
    teacherId: "TEA-201",
    teacherName: "دکتر مسعود حمیدی",
    lessonName: "ریاضی و دیفرانسیل",
    status: "active",
    studentCount: 32,
    presentCount: 29,
    studentsOutCount: 1,
    studentsOutDetails: [
      {
        studentId: "STU-103",
        name: "مهران احمدی",
        outSince: new Date(Date.now() - 4 * 60000).toISOString(), // 4 minutes ago
        durationMinutes: 4
      }
    ]
  },
  {
    id: "102",
    grade: "یازدهم تجربی",
    teacherId: "TEA-202",
    teacherName: "خانم مهشید موسوی",
    lessonName: "شیمی و زیست‌شناسی",
    status: "active",
    studentCount: 28,
    presentCount: 27,
    studentsOutCount: 0,
    studentsOutDetails: []
  },
  {
    id: "103",
    grade: "دوازدهم انسانی",
    teacherId: null,
    teacherName: null,
    lessonName: null,
    status: "teacher_late",
    studentCount: 30,
    presentCount: 25,
    studentsOutCount: 0,
    studentsOutDetails: []
  }
];

// Seed Security Alerts
let securityAlerts: SecurityAlert[] = [
  {
    id: "ALT-001",
    timestamp: "2026-07-20T08:02:15Z",
    type: "teacher_late",
    severity: "medium",
    message: "تاخیر بیش از ۱۰ دقیقه دکتر حمیدی در ورود به کلاس ۱۰۳",
    resolved: true,
    cameraName: "دوربین راهرو طبقه اول"
  },
  {
    id: "ALT-002",
    timestamp: "2026-07-20T08:12:00Z",
    type: "student_missing",
    severity: "high",
    message: "هشدار: خروج طولانی‌مدت (بیش از ۳ دقیقه) دانش‌آموز مهران احمدی از کلاس ۱۰۱",
    resolved: false,
    cameraName: "دوربین راهرو طبقه اول"
  },
  {
    id: "ALT-003",
    timestamp: "2026-07-20T08:20:45Z",
    type: "unknown_face",
    severity: "high",
    message: "شناسایی فرد ناشناس در محوطه حیاط غربی دبیرستان",
    resolved: false,
    cameraName: "CCTV حیاط غربی"
  }
];

// Background Simulator to increment "out" durations for students and generate fresh logs occasionally
setInterval(() => {
  classroomStatuses = classroomStatuses.map(cls => {
    if (cls.studentsOutDetails.length > 0) {
      const updatedDetails = cls.studentsOutDetails.map(stu => {
        const diffMs = Date.now() - new Date(stu.outSince).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        return {
          ...stu,
          durationMinutes: diffMins
        };
      });

      // Trigger warning alert automatically if duration exceeds 3 minutes and alert hasn't been generated
      updatedDetails.forEach(stu => {
        if (stu.durationMinutes >= 3) {
          const alertExists = securityAlerts.some(a => a.type === "student_missing" && a.message.includes(stu.name) && !a.resolved);
          if (!alertExists) {
            const newAlert: SecurityAlert = {
              id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toISOString(),
              type: "student_missing",
              severity: "high",
              message: `هشدار: خروج طولانی‌مدت (بیش از ۳ دقیقه) دانش‌آموز ${stu.name} از کلاس ${cls.id}`,
              resolved: false,
              cameraName: `دوربین راهرو کلاس ${cls.id}`
            };
            securityAlerts.unshift(newAlert);
          }
        }
      });

      return {
        ...cls,
        studentsOutDetails: updatedDetails,
        studentsOutCount: updatedDetails.length
      };
    }
    return cls;
  });
}, 20000); // Check every 20 seconds

// --- CRUD ENDPOINTS FOR USERS ---

// GET: List all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// GET: Single user
app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "کاربر پیدا نشد" });
  }
  res.json(user);
});

// POST: Register a user
app.post("/api/users", (req, res) => {
  const { name, role, nationalId, phone, grade, classRoom, parentId, subject, classes, position, childId, photoUrl } = req.body;
  
  if (!name || !role || !nationalId) {
    return res.status(400).json({ message: "اطلاعات ضروری ارسال نشده است." });
  }

  // Check if national id exists
  const exists = users.some(u => u.nationalId === nationalId);
  if (exists) {
    return res.status(400).json({ message: "کاربری با این کد ملی قبلاً ثبت شده است." });
  }

  // Create prefix code
  let prefix = "STU";
  if (role === "teacher") prefix = "TEA";
  if (role === "staff") prefix = "STF";
  if (role === "parent") prefix = "PAR";

  const numId = Math.floor(100 + Math.random() * 900);
  const id = `${prefix}-${numId}`;

  let newUser: SchoolUser;
  const baseData = {
    id,
    name,
    role,
    nationalId,
    phone: phone || "09120000000",
    registeredAt: new Date().toISOString(),
    photoUrl: photoUrl || null
  };

  if (role === "student") {
    newUser = {
      ...baseData,
      role: "student",
      grade: grade || "دهم",
      classRoom: classRoom || "101",
      parentId: parentId || ""
    } as SchoolUser;
  } else if (role === "teacher") {
    newUser = {
      ...baseData,
      role: "teacher",
      subject: subject || "عمومی",
      classes: classes || []
    } as SchoolUser;
  } else if (role === "staff") {
    newUser = {
      ...baseData,
      role: "staff",
      position: position || "کارمند"
    } as SchoolUser;
  } else {
    newUser = {
      ...baseData,
      role: "parent",
      childId: childId || ""
    } as SchoolUser;
  }

  users.push(newUser);
  res.status(210).json(newUser);
});

// PUT: Update user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "کاربر یافت نشد" });
  }

  const updatedUser = { ...users[userIndex], ...req.body };
  users[userIndex] = updatedUser;
  res.json(updatedUser);
});

// DELETE: Delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "کاربر یافت نشد" });
  }

  users.splice(userIndex, 1);
  res.json({ message: "کاربر با موفقیت حذف شد." });
});

// --- TRAFFIC & CLASSROOMS ENDPOINTS ---

// GET: All Traffic Logs
app.get("/api/traffic-logs", (req, res) => {
  res.json(trafficLogs);
});

// POST: Add traffic log manually or simulated scan
app.post("/api/traffic-logs", (req, res) => {
  const { userId, type, cameraName } = req.body;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: "کاربر معتبر یافت نشد." });
  }

  // Determine lateness
  const now = new Date();
  const hour = now.getHours();
  const isMorningIn = type === "in" && hour >= 8; // School starts at 8:00
  const status = isMorningIn ? "late" : "normal";

  const newLog: TrafficLog = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    timestamp: now.toISOString(),
    type: type || "in",
    status,
    cameraName: cameraName || "دوربین اسکنر گیت ورودی"
  };

  trafficLogs.unshift(newLog);

  // If student enters, update class count
  if (user.role === "student") {
    const sDetails = user;
    const cls = classroomStatuses.find(c => c.id === sDetails.classRoom);
    if (cls) {
      if (type === "in") {
        cls.presentCount = Math.min(cls.studentCount, cls.presentCount + 1);
      } else {
        cls.presentCount = Math.max(0, cls.presentCount - 1);
      }
    }
  }

  // If teacher enters/leaves
  if (user.role === "teacher") {
    const tDetails = user;
    tDetails.classes.forEach(cId => {
      const cls = classroomStatuses.find(c => c.id === cId);
      if (cls) {
        if (type === "in") {
          cls.teacherId = user.id;
          cls.teacherName = user.name;
          cls.lessonName = tDetails.subject;
          cls.status = "active";
        } else {
          cls.teacherId = null;
          cls.teacherName = null;
          cls.lessonName = null;
          cls.status = "no_teacher";
        }
      }
    });
  }

  res.json(newLog);
});

// GET: Classroom Monitor Status
app.get("/api/classroom-status", (req, res) => {
  res.json(classroomStatuses);
});

// PUT: Simulate classroom activity (e.g., student leaves classroom, teacher arrives)
app.put("/api/classroom-status/:id", (req, res) => {
  const { id } = req.params;
  const { action, studentId } = req.body; // action: 'student_leaves' | 'student_returns' | 'teacher_leaves'
  
  const clsIndex = classroomStatuses.findIndex(c => c.id === id);
  if (clsIndex === -1) {
    return res.status(404).json({ message: "کلاس یافت نشد" });
  }

  const cls = classroomStatuses[clsIndex];

  if (action === "student_leaves") {
    const sId = studentId || "STU-101";
    const student = users.find(u => u.id === sId);
    if (student) {
      const exists = cls.studentsOutDetails.some(s => s.studentId === sId);
      if (!exists) {
        cls.studentsOutDetails.push({
          studentId: sId,
          name: student.name,
          outSince: new Date().toISOString(),
          durationMinutes: 0
        });
        cls.studentsOutCount = cls.studentsOutDetails.length;
      }
    }
  } else if (action === "student_returns") {
    const sId = studentId || "STU-101";
    cls.studentsOutDetails = cls.studentsOutDetails.filter(s => s.studentId !== sId);
    cls.studentsOutCount = cls.studentsOutDetails.length;
    // Resolve any outstanding student missing alerts
    securityAlerts = securityAlerts.map(a => {
      if (a.type === "student_missing" && a.message.includes(sId)) {
        return { ...a, resolved: true };
      }
      return a;
    });
  } else if (action === "teacher_leaves") {
    cls.teacherId = null;
    cls.teacherName = null;
    cls.lessonName = null;
    cls.status = "no_teacher";
  }

  classroomStatuses[clsIndex] = cls;
  res.json(cls);
});

// --- SECURITY ALERTS ENDPOINTS ---

// GET: All active or resolved alerts
app.get("/api/alerts", (req, res) => {
  res.json(securityAlerts);
});

// POST: Resolve alert
app.post("/api/alerts/:id/resolve", (req, res) => {
  const { id } = req.params;
  const alertIndex = securityAlerts.findIndex(a => a.id === id);
  if (alertIndex === -1) {
    return res.status(404).json({ message: "هشدار پیدا نشد" });
  }

  securityAlerts[alertIndex].resolved = true;
  res.json(securityAlerts[alertIndex]);
});

// POST: Simulate alert manually
app.post("/api/alerts/simulate", (req, res) => {
  const { type, severity, message, cameraName } = req.body;

  const newAlert: SecurityAlert = {
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    type: type || "unknown_face",
    severity: severity || "high",
    message: message || "یک رویداد مشکوک توسط دوربین‌ها شناسایی شد",
    resolved: false,
    cameraName: cameraName || "دوربین نظارتی حیاط"
  };

  securityAlerts.unshift(newAlert);
  res.json(newAlert);
});

// --- STATS ENDPOINT ---
app.get("/api/stats", (req, res) => {
  const totalStudents = users.filter(u => u.role === "student").length;
  const presentStudents = 29 + 27 + 25; // derived from seeded classes
  const totalTeachers = users.filter(u => u.role === "teacher").length;
  const presentTeachers = users.filter(u => u.role === "teacher" && trafficLogs.some(l => l.userId === u.id && l.type === "in")).length;
  const activeAlertsCount = securityAlerts.filter(a => !a.resolved).length;

  res.json({
    totalStudents,
    presentStudents,
    totalTeachers,
    presentTeachers,
    activeAlertsCount
  });
});

// --- CORE COMPUTER VISION PROXY USING GEMINI AI ---
app.post("/api/ai/analyze-frame", async (req, res) => {
  const { imageFrame, cameraSource } = req.body; // imageFrame is a base64 encoded png/jpeg image

  if (!imageFrame) {
    return res.status(400).json({ message: "فریم عکس دریافت نشد." });
  }

  const cleanBase64 = imageFrame.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  if (hasGeminiKey && ai) {
    try {
      console.log(`Sending camera frame to Gemini AI for analysis (Source: ${cameraSource || 'Webcam'})...`);
      
      const imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64
        }
      };

      const systemInstruction = `You are the Computer Vision AI engine of 'Hushyar' - a secure school attendance and smart monitoring system.
Analyze the image frame carefully. We are checking for multiple threat levels and attendance logs:
1. Stranger Detection: Do you see an unknown person or someone trying to infiltrate without access?
2. Dangerous Objects: Scan for firearms (pistols, rifles, handguns), knives, swords, or blades.
3. Behavior and Action Recognition:
   - Identify physical fights, aggressive wrestling, brawls, punching, or violence between students/people.
   - Medical Emergency: Identify falls (Fall Detection - e.g. someone lying down on the ground, passed out, falling down steps, or visibly ill).
4. Identify if there's a specific facial feature or if it's a normal classroom scene.

You MUST return a strict JSON response. Do not output markdown, wrappers, or backticks outside the JSON. Return only a valid JSON matching this TypeScript schema:
{
  "detectedObjects": string[],
  "isWeaponDetected": boolean,
  "isFightDetected": boolean,
  "isFallDetected": boolean,
  "isMedicalEmergency": boolean,
  "isStranger": boolean,
  "recognizedName": string | null,
  "description": "A very brief 1-sentence description of the snapshot and analysis in Persian (Farsi)",
  "alertSeverity": "none" | "low" | "medium" | "high" | "critical"
}
Ensure the Persian text is warm, highly professional, and grammatically perfect RTL.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: "Inspect this camera frame and provide security threat analysis." }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const parsedAnalysis = JSON.parse(responseText.trim());

      console.log("Gemini AI successfully processed the frame. Analysis results:", parsedAnalysis);

      // If a threat/emergency is detected, automatically seed a real alert in our database!
      if (
        parsedAnalysis.isWeaponDetected ||
        parsedAnalysis.isFightDetected ||
        parsedAnalysis.isFallDetected ||
        parsedAnalysis.isMedicalEmergency ||
        (parsedAnalysis.isStranger && parsedAnalysis.alertSeverity !== "none")
      ) {
        let type: SecurityAlert["type"] = "unknown_face";
        let PersianMsg = parsedAnalysis.description;

        if (parsedAnalysis.isWeaponDetected) {
          type = "weapon_detected";
          PersianMsg = `هشدار فوق‌العاده امنیتی: شناسایی شیء مشکوک/سلاح (${parsedAnalysis.detectedObjects?.join(', ') || 'سلاح'}) در ${cameraSource || 'وبکم کاربر'}`;
        } else if (parsedAnalysis.isFightDetected) {
          type = "fight_detected";
          PersianMsg = `هشدار حراست: شناسایی درگیری فیزیکی و خشونت در محدوده ${cameraSource || 'وبکم کاربر'}`;
        } else if (parsedAnalysis.isFallDetected) {
          type = "fall_detected";
          PersianMsg = `هشدار پزشکی: شناسایی سقوط فرد روی زمین (خطر غش/مصدومیت) در ${cameraSource || 'وبکم کاربر'}`;
        } else if (parsedAnalysis.isMedicalEmergency) {
          type = "medical_emergency";
          PersianMsg = `هشدار اورژانسی: وضعیت وخیم پزشکی شناسایی‌شده در ${cameraSource || 'وبکم کاربر'}`;
        } else if (parsedAnalysis.isStranger) {
          type = "unknown_face";
          PersianMsg = `گزارش تردد: حضور فرد شناسایی‌نشده و فاقد کارت پرسنلی در ${cameraSource || 'وبکم کاربر'}`;
        }

        const newAlert: SecurityAlert = {
          id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          type,
          severity: parsedAnalysis.alertSeverity || "high",
          message: PersianMsg,
          resolved: false,
          cameraName: cameraSource || "وبکم نظارتی",
          imageUrl: `data:image/png;base64,${cleanBase64}` // Save image for admin to view
        };

        securityAlerts.unshift(newAlert);
      }

      return res.json({
        success: true,
        source: "Gemini AI",
        analysis: parsedAnalysis
      });

    } catch (err) {
      console.error("Error communicating with Gemini Vision API:", err);
      return res.status(500).json({
        success: false,
        message: "خطا در پردازش تصویر توسط هوش مصنوعی",
        error: String(err)
      });
    }
  } else {
    // --- LOCAL INTELLIGENT HEURISTIC Fallback (Offline Mode) ---
    // If the API key isn't provided, we scan for a special simulator mode based on the cameraSource name, 
    // or let the client simulate a result.
    console.log("Analyzing via local mock/simulation...");
    
    // We will build a helper that checks what the user is simulating, or returns a safe response.
    let analysis = {
      detectedObjects: [] as string[],
      isWeaponDetected: false,
      isFightDetected: false,
      isFallDetected: false,
      isMedicalEmergency: false,
      isStranger: false,
      recognizedName: null as string | null,
      description: "تصویر وبکم با موفقیت دریافت شد. وضعیت عادی است.",
      alertSeverity: "none"
    };

    // If the client requested a specific test action or based on cameraSource
    if (cameraSource === "دوربین ۱ - آزمایش سلاح") {
      analysis = {
        detectedObjects: ["knife", "handgun"],
        isWeaponDetected: true,
        isFightDetected: false,
        isFallDetected: false,
        isMedicalEmergency: false,
        isStranger: true,
        recognizedName: null,
        description: "هشدار فوق‌العاده بحرانی: شناسایی شیء فلزی مشکوک شبیه به سلاح گرم/سرد در کادر دوربین!",
        alertSeverity: "critical"
      };
    } else if (cameraSource === "دوربین ۲ - شبیه‌ساز افتادن") {
      analysis = {
        detectedObjects: ["person"],
        isWeaponDetected: false,
        isFightDetected: false,
        isFallDetected: true,
        isMedicalEmergency: true,
        isStranger: false,
        recognizedName: "آرش رضایی",
        description: "هشدار پزشکی فوری: سقوط ناگهانی دانش‌آموز آرش رضایی روی زمین و عدم تحرک!",
        alertSeverity: "high"
      };
    } else if (cameraSource === "دوربین ۳ - درگیری فیزیکی") {
      analysis = {
        detectedObjects: ["people"],
        isWeaponDetected: false,
        isFightDetected: true,
        isFallDetected: false,
        isMedicalEmergency: false,
        isStranger: false,
        recognizedName: null,
        description: "هشدار حراست: شناسایی برخورد فیزیکی تهاجمی بین دو فرد در محوطه مدرسه.",
        alertSeverity: "high"
      };
    } else {
      // Look at the image base64 length or random factor to mock something if requested, otherwise normal
      const rand = Math.random();
      if (rand > 0.85) {
        // Mock a stranger detection for fun interaction
        analysis = {
          detectedObjects: ["person"],
          isWeaponDetected: false,
          isFightDetected: false,
          isFallDetected: false,
          isMedicalEmergency: false,
          isStranger: true,
          recognizedName: null,
          description: "شناسایی چهره ناشناس در گیت ورودی اصلی. هشدار ورود غیرمجاز صادر شد.",
          alertSeverity: "medium"
        };
      }
    }

    // Auto-create alert in local db if a threat was generated
    if (analysis.alertSeverity !== "none") {
      let type: SecurityAlert["type"] = "unknown_face";
      if (analysis.isWeaponDetected) type = "weapon_detected";
      else if (analysis.isFightDetected) type = "fight_detected";
      else if (analysis.isFallDetected) type = "fall_detected";

      const newAlert: SecurityAlert = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        type,
        severity: analysis.alertSeverity as SecurityAlert["severity"],
        message: analysis.description,
        resolved: false,
        cameraName: cameraSource || "وبکم شبیه‌ساز",
        imageUrl: `data:image/png;base64,${cleanBase64}`
      };
      securityAlerts.unshift(newAlert);
    }

    return res.json({
      success: true,
      source: "Local Heuristic Engine (No API Key Active)",
      analysis
    });
  }
});


// --- VITE MIDDLEWARE OR STATIC FILES ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
