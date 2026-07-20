import React, { useState } from "react";
import { 
  Clock, 
  User, 
  DoorOpen, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  ArrowRight,
  UserX,
  UserCheck,
  Play
} from "lucide-react";
import { ClassroomStatus, SchoolUser, UserRole } from "../types";

interface ClassroomMonitoringProps {
  classrooms: ClassroomStatus[];
  users: SchoolUser[];
  onUpdateClassroom: (id: string, action: string, studentId?: string) => Promise<any>;
  currentUserRole: UserRole | 'admin';
}

export default function ClassroomMonitoring({ 
  classrooms, 
  users, 
  onUpdateClassroom,
  currentUserRole
}: ClassroomMonitoringProps) {
  
  const [selectedStudentForClass, setSelectedStudentForClass] = useState<Record<string, string>>({});

  const handleStudentLeave = (classId: string) => {
    const studentId = selectedStudentForClass[classId];
    if (!studentId) return;
    onUpdateClassroom(classId, "student_leaves", studentId);
  };

  const handleStudentReturn = (classId: string, studentId: string) => {
    onUpdateClassroom(classId, "student_returns", studentId);
  };

  const handleTeacherLeave = (classId: string) => {
    onUpdateClassroom(classId, "teacher_leaves");
  };

  return (
    <div className="space-y-6" id="classroom_monitoring_panel">
      
      {/* Intro block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white">مانیتورینگ هوشمند کلاس‌های درس و راهروها</h3>
        <p className="text-xs text-slate-400 mt-1">
          رصد هوشمند حضور دبیران و موقعیت زمانی دانش‌آموزان خارج از کلاس. در صورت ترک کلاس توسط دانش‌آموز بیش از ۳ دقیقه، سیستم به ناظم هشدار می‌دهد.
        </p>
      </div>

      {/* Classroom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="classroom_status_grid">
        {classrooms.map((cls) => {
          
          // Get students in this specific classroom for simulation dropdown
          const classStudents = users.filter(u => u.role === "student" && (u as any).classRoom === cls.id);

          return (
            <div 
              key={cls.id} 
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition ${
                cls.status === "teacher_late" ? "border-amber-900 bg-amber-950/5" : "border-slate-800"
              }`}
              id={`class_card_${cls.id}`}
            >
              <div>
                {/* Header: Class ID and state */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-white">کلاس {cls.id}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{cls.grade}</p>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold flex items-center gap-1 ${
                    cls.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    cls.status === "teacher_late" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse" :
                    "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {cls.status === "active" && (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>در حال تدریس</span>
                      </>
                    )}
                    {cls.status === "teacher_late" && (
                      <>
                        <AlertTriangle className="w-3 h-3 animate-bounce" />
                        <span>هشدار: تأخیر معلم</span>
                      </>
                    )}
                    {cls.status === "no_teacher" && <span>بدون دبیر / اتمام درس</span>}
                  </span>
                </div>

                {/* Teacher block */}
                <div className="mt-5 p-3.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center overflow-hidden">
                    {cls.teacherId ? (
                      <img 
                        src={users.find(u => u.id === cls.teacherId)?.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"} 
                        alt={cls.teacherName || ""} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">دبیر کلاس:</span>
                    <span className="text-xs font-bold text-white">
                      {cls.teacherName || "ثبت‌نشده (تاخیر در حضور)"}
                    </span>
                    {cls.lessonName && (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full mr-1.5 font-semibold">
                        {cls.lessonName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Present stats bar */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-500">حاضرین کلاس:</span>
                    <p className="text-sm font-bold text-white mt-1">{cls.presentCount} <span className="text-xs font-normal text-slate-500">از {cls.studentCount}</span></p>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${
                    cls.studentsOutCount > 0 ? "bg-red-950/10 border-red-900/30 text-red-400" : "bg-slate-950/40 border-slate-850 text-slate-400"
                  }`}>
                    <span className="text-[10px]">خارج از کلاس:</span>
                    <p className="text-sm font-bold mt-1">{cls.studentsOutCount} نفر</p>
                  </div>
                </div>

                {/* List of students currently out (WITH TIMER) */}
                {cls.studentsOutDetails.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">لیست تردد راهروهای اطراف کلاس:</span>
                    {cls.studentsOutDetails.map((stu) => {
                      const isDanger = stu.durationMinutes >= 3;
                      return (
                        <div 
                          key={stu.studentId}
                          className={`p-2.5 rounded-lg text-xs flex justify-between items-center transition border ${
                            isDanger 
                              ? "bg-red-950/30 border-red-900/60 text-red-400 animate-pulse" 
                              : "bg-slate-950 border-slate-850 text-slate-300"
                          }`}
                        >
                          <div>
                            <span className="font-bold">{stu.name}</span>
                            <span className="text-[9px] text-slate-500 block">مجوز خروج موقت (آبریزگاه/اداری)</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded ${
                              isDanger ? "bg-red-500/20 text-red-500" : "bg-slate-800 text-slate-400"
                            }`}>
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>{stu.durationMinutes} دقیقه</span>
                            </span>

                            {/* Return student action */}
                            {currentUserRole !== "parent" && (
                              <button 
                                onClick={() => handleStudentReturn(cls.id, stu.studentId)}
                                className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white p-1 rounded border border-emerald-500/20 transition"
                                title="ثبت بازگشت دانش‌آموز به کلاس"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Classroom Simulators (Admin Only) */}
              {currentUserRole !== "parent" && (
                <div className="mt-6 pt-4 border-t border-slate-850 space-y-3" id="classroom_sim_widget">
                  <span className="text-[10px] text-blue-400 font-bold block">شبیه‌ساز رفتار کلاس {cls.id}:</span>
                  
                  {/* Leave class selection */}
                  <div className="flex gap-2">
                    <select
                      value={selectedStudentForClass[cls.id] || ""}
                      onChange={(e) => setSelectedStudentForClass({
                        ...selectedStudentForClass,
                        [cls.id]: e.target.value
                      })}
                      className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-white flex-1"
                    >
                      <option value="">دانش‌آموز...</option>
                      {classStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleStudentLeave(cls.id)}
                      disabled={!selectedStudentForClass[cls.id]}
                      className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-[10px] px-2.5 py-1 rounded transition whitespace-nowrap"
                    >
                      خروج دانش‌آموز
                    </button>
                  </div>

                  {/* Teacher actions */}
                  {cls.teacherId && (
                    <button
                      onClick={() => handleTeacherLeave(cls.id)}
                      className="w-full bg-slate-950 hover:bg-red-950/20 border border-slate-850 hover:border-red-900 text-slate-400 hover:text-red-400 font-semibold text-[10px] py-1.5 rounded transition flex items-center justify-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>شبیه‌سازی ترک ناگهانی دبیر از کلاس (تاخیر/غیبت)</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
