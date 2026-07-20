/**
 * Shared Type Definitions for Smart School Security & Attendance System (Hushyar)
 */

export type UserRole = 'student' | 'teacher' | 'staff' | 'parent';

export interface BaseUser {
  id: string; // e.g. STU-101, TEA-201, parent is linked
  name: string;
  role: UserRole;
  nationalId: string; // کد ملی
  phone: string;
  registeredAt: string;
  photoUrl: string | null; // Profile picture reference base64/url
}

export interface StudentDetails extends BaseUser {
  role: 'student';
  grade: string; // e.g., دهم ریاضی, یازدهم تجربی
  classRoom: string; // e.g., 101, 102
  parentId: string; // Link to parent ID
}

export interface TeacherDetails extends BaseUser {
  role: 'teacher';
  subject: string; // e.g., ریاضی, فیزیک
  classes: string[]; // List of classrooms they teach
}

export interface StaffDetails extends BaseUser {
  role: 'staff';
  position: string; // e.g., ناظم, مدیر, حراست, معاون
}

export interface ParentDetails extends BaseUser {
  role: 'parent';
  childId: string; // Link to student ID
}

export type SchoolUser = StudentDetails | TeacherDetails | StaffDetails | ParentDetails;

export interface TrafficLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  timestamp: string;
  type: 'in' | 'out';
  status: 'normal' | 'late' | 'unauthorized';
  cameraName: string; // e.g. "درب ورودی اصلی", "درب پارکینگ"
}

export interface ClassroomStatus {
  id: string; // Class name or number, e.g., "101"
  grade: string;
  teacherId: string | null;
  teacherName: string | null;
  lessonName: string | null;
  status: 'active' | 'no_teacher' | 'teacher_late' | 'empty';
  studentCount: number;
  presentCount: number;
  studentsOutCount: number;
  studentsOutDetails: Array<{
    studentId: string;
    name: string;
    outSince: string; // ISO Time
    durationMinutes: number;
  }>;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'unknown_face' | 'weapon_detected' | 'fight_detected' | 'fall_detected' | 'medical_emergency' | 'student_missing' | 'teacher_late';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string; // Farsi text
  resolved: boolean;
  cameraName: string; // e.g. "دوربین ورودی اصلی", "دوربین حیاط", "کلاس ۱۰۲"
  imageUrl?: string; // Captures base64 frame if available
}

export interface DashboardStats {
  totalStudents: number;
  presentStudents: number;
  totalTeachers: number;
  presentTeachers: number;
  activeAlertsCount: number;
}
