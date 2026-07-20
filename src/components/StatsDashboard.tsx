import React from "react";
import { 
  Users, 
  GraduationCap, 
  AlertTriangle, 
  DoorOpen, 
  Clock, 
  CheckCircle2, 
  Calendar,
  Activity,
  UserCheck,
  ShieldAlert
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie
} from "recharts";
import { SchoolUser, TrafficLog, SecurityAlert } from "../types";

interface StatsDashboardProps {
  users: SchoolUser[];
  trafficLogs: TrafficLog[];
  alerts: SecurityAlert[];
  onAddTrafficSim: (userId: string, type: 'in' | 'out') => void;
}

export default function StatsDashboard({ users, trafficLogs, alerts, onAddTrafficSim }: StatsDashboardProps) {
  // Statistics calculations
  const totalStudents = users.filter(u => u.role === "student").length;
  const presentStudents = users.filter(u => u.role === "student" && trafficLogs.some(l => l.userId === u.id && l.type === "in" && !trafficLogs.some(o => o.userId === u.id && o.type === "out" && new Date(o.timestamp) > new Date(l.timestamp)))).length;
  
  const totalTeachers = users.filter(u => u.role === "teacher").length;
  const presentTeachers = users.filter(u => u.role === "teacher" && trafficLogs.some(l => l.userId === u.id && l.type === "in" && !trafficLogs.some(o => o.userId === u.id && o.type === "out" && new Date(o.timestamp) > new Date(l.timestamp)))).length;

  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === "high" || a.severity === "critical").length;

  // Pie chart data: Role distribution
  const rolesData = [
    { name: "دانش‌آموزان", value: totalStudents, color: "#3B82F6" },
    { name: "معلمان", value: totalTeachers, color: "#10B981" },
    { name: "کادر اجرایی", value: users.filter(u => u.role === "staff").length, color: "#F59E0B" },
    { name: "اولیا", value: users.filter(u => u.role === "parent").length, color: "#8B5CF6" }
  ];

  // Simulated traffic peaks data (Hourly traffic for today)
  const hourlyTrafficData = [
    { hour: "۰۷:۰۰", ورود: 12, خروج: 1 },
    { hour: "۰۷:۳۰", ورود: 58, خروج: 2 },
    { hour: "۰۸:۰۰", ورود: 14, خروج: 0 },
    { hour: "۰۸:۳۰", ورود: 3, خروج: 5 },
    { hour: "۱۲:۰۰", ورود: 1, خروج: 8 },
    { hour: "۱۳:۰۰", ورود: 0, خروج: 45 },
    { hour: "۱۴:۰۰", ورود: 0, خروج: 22 }
  ];

  // Daily attendance statistics for Recharts
  const weeklyAttendanceData = [
    { day: "شنبه", دانش_آموزان: 94, معلمان: 100 },
    { day: "یکشنبه", دانش_آموزان: 92, معلمان: 95 },
    { day: "دوشنبه", دانش_آموزان: 96, معلمان: 100 },
    { day: "سه‌شنبه", دانش_آموزان: 89, معلمان: 90 },
    { day: "چهارشنبه", دانش_آموزان: 95, معلمان: 100 }
  ];

  // Format time helper
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "00:00";
    }
  };

  return (
    <div className="space-y-6" id="dashboard_panel">
      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Students */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="card_student_stats">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium mb-1">دانش‌آموزان حاضر</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {presentStudents} <span className="text-sm font-normal text-slate-500">از {totalStudents}</span>
              </h3>
              <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0}٪ نرخ حضور امروز</span>
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        </div>

        {/* Metric 2: Teachers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="card_teacher_stats">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium mb-1">دبیران حاضر</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {presentTeachers} <span className="text-sm font-normal text-slate-500">از {totalTeachers}</span>
              </h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>۹۰٪ حضور به موقع دبیران</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        </div>

        {/* Metric 3: Active Classrooms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden" id="card_classroom_stats">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium mb-1">کلاس‌های فعال مانیتورینگ</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">۳ / ۳</h3>
              <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>۱ کلاس در وضعیت انتظار معلم</span>
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
              <DoorOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
        </div>

        {/* Metric 4: Security Alerts */}
        <div className={`border rounded-xl p-5 relative overflow-hidden transition-all duration-300 ${
          criticalAlertsCount > 0 
            ? "bg-red-950/40 border-red-900 animate-pulse" 
            : "bg-slate-900 border-slate-800"
        }`} id="card_security_stats">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-medium mb-1">تهدیدات امنیتی فعال</p>
              <h3 className={`text-3xl font-bold tracking-tight ${criticalAlertsCount > 0 ? "text-red-500" : "text-white"}`}>
                {activeAlerts.length}
              </h3>
              <p className={`text-xs mt-2 flex items-center gap-1 ${criticalAlertsCount > 0 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{criticalAlertsCount} مورد بحرانی نیاز به اقدام</span>
              </p>
            </div>
            <div className={`p-3 rounded-lg ${criticalAlertsCount > 0 ? "bg-red-500/20 text-red-500" : "bg-red-500/10 text-red-400"}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${criticalAlertsCount > 0 ? "bg-red-600" : "bg-red-500"}`}></div>
        </div>

      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Real-Time Traffic Peaks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 flex flex-col justify-between" id="chart_hourly_traffic">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-base font-semibold text-white">ترافیک تردد و عبور و مرور امروز</h4>
              <p className="text-xs text-slate-400 mt-1">آمارهای اوج تردد گیت‌های اسکن چهره هوشمند در ساعات درسی</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>پخش زنده سیستم</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", color: "#fff", direction: "rtl", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="ورود" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="خروج" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-4 text-xs text-slate-400 mt-2 justify-center border-t border-slate-800 pt-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>آمار ورودی (کارت اسکن چهره)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-pink-500 rounded-full"></span>آمار خروجی (خروج موقت/دائم)</span>
          </div>
        </div>

        {/* User Roles Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between" id="chart_roles_breakdown">
          <div>
            <h4 className="text-base font-semibold text-white">توزیع کاربران سامانه</h4>
            <p className="text-xs text-slate-400 mt-1">پروفایل‌های هوشمند ثبت‌نام شده برای تشخیص چهره</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rolesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {rolesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xs text-slate-400 block">کل کاربران</span>
              <span className="text-2xl font-bold text-white">{users.length}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            {rolesData.map((role, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }}></span>
                  {role.name}
                </span>
                <span className="font-semibold text-white">{role.value} نفر</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Panel: Live Gate Scanners Feed & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Scanners Scrolling Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1 flex flex-col h-[350px]" id="live_scanners_feed">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-base font-semibold text-white">عبور و مرور زنده دوربین‌ها</h4>
              <p className="text-xs text-slate-400 mt-1">مانیتورینگ بر خط اسکنر گیت‌ها</p>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="overflow-y-auto flex-1 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {trafficLogs.slice(0, 10).map((log, index) => {
              const matchedUser = users.find(u => u.id === log.userId);
              return (
                <div key={log.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-center gap-3 hover:border-slate-700 transition">
                  <img 
                    src={matchedUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                    alt={log.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold text-white truncate">{log.userName}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        log.userRole === "student" ? "bg-blue-500/10 text-blue-400" :
                        log.userRole === "teacher" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-purple-500/10 text-purple-400"
                      }`}>
                        {log.userRole === "student" ? "دانش‌آموز" : log.userRole === "teacher" ? "دبیر" : "کادر اجرایی"}
                      </span>
                      <span className={`text-[10px] font-medium ${
                        log.type === "in" ? "text-emerald-400" : "text-pink-400"
                      }`}>
                        {log.type === "in" ? "← ورود به مدرسه" : "→ خروج از مدرسه"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Attendance Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 flex flex-col justify-between" id="chart_weekly_history">
          <div>
            <h4 className="text-base font-semibold text-white">نرخ حضور هفتگی هوشمند (٪)</h4>
            <p className="text-xs text-slate-400 mt-1">مقایسه درصد حضور معلمان و دانش‌آموزان در ۵ روز آموزشی گذشته</p>
          </div>

          <div className="h-60 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[70, 100]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", color: "#fff", direction: "rtl", borderRadius: "8px" }} />
                <Bar dataKey="دانش_آموزان" name="حضور دانش‌آموزان" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="معلمان" name="حضور دبیران" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 text-xs text-slate-400 mt-2 justify-center border-t border-slate-800 pt-3">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>میانگین حضور دانش‌آموزان (۹۳.۲٪)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>میانگین حضور دبیران (۹۷.۰٪)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
