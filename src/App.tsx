import React, { useState, useEffect } from "react";
import { 
  Monitor, 
  Users, 
  Clock, 
  DoorOpen, 
  Zap, 
  Lock, 
  ShieldAlert, 
  Bell, 
  Settings,
  Shield,
  HelpCircle,
  Eye,
  Activity
} from "lucide-react";
import { SchoolUser, TrafficLog, ClassroomStatus, SecurityAlert } from "./types";
import StatsDashboard from "./components/StatsDashboard";
import UserManagement from "./components/UserManagement";
import AttendanceLogs from "./components/AttendanceLogs";
import ClassroomMonitoring from "./components/ClassroomMonitoring";
import AiVisionLab from "./components/AiVisionLab";
import AlertBanner from "./components/AlertBanner";
import QuickSimulator from "./components/QuickSimulator";

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'traffic' | 'classrooms' | 'aivision'>('dashboard');
  
  // Role-Based Access Simulation States
  const [currentRole, setCurrentRole] = useState<'admin' | 'teacher' | 'parent'>('admin');
  const simulatedParentId = "PAR-401"; // علیرضا رضایی (پدر آرش رضایی)
  
  // Database States loaded from server
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomStatus[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  // API sync polling helper
  const syncDataWithBackend = async () => {
    try {
      const [uRes, tRes, cRes, aRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/traffic-logs"),
        fetch("/api/classroom-status"),
        fetch("/api/alerts")
      ]);

      if (uRes.ok && tRes.ok && cRes.ok && aRes.ok) {
        setUsers(await uRes.json());
        setTrafficLogs(await tRes.json());
        setClassrooms(await cRes.json());
        setAlerts(await aRes.json());
      }
    } catch (e) {
      console.warn("Backend API sync failed. Operating in transient client mode.", e);
    }
  };

  // Sync immediately and establish active polling (every 3s) for real-time traffic simulators
  useEffect(() => {
    syncDataWithBackend();
    const interval = setInterval(syncDataWithBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- DATABASE MUTATION PROXIES ---

  // Add User
  const handleAddUser = async (userPayload: any) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "خطا در ثبت کاربر");
    }
    syncDataWithBackend();
  };

  // Update User
  const handleUpdateUser = async (id: string, updatePayload: any) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload)
    });
    if (response.ok) syncDataWithBackend();
  };

  // Delete User
  const handleDeleteUser = async (id: string) => {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE"
    });
    if (response.ok) syncDataWithBackend();
  };

  // Log manual scan
  const handleAddTrafficSim = async (userId: string, type: 'in' | 'out', cameraName?: string) => {
    const response = await fetch("/api/traffic-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, cameraName })
    });
    if (response.ok) syncDataWithBackend();
  };

  // Update Classroom Status
  const handleUpdateClassroom = async (classId: string, action: string, studentId?: string) => {
    const response = await fetch(`/api/classroom-status/${classId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, studentId })
    });
    if (response.ok) syncDataWithBackend();
  };

  // Resolve Alert
  const handleResolveAlert = async (alertId: string) => {
    const response = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: "POST"
    });
    if (response.ok) syncDataWithBackend();
  };

  // Manual Alert simulation
  const handleSimulateAlert = async (type: string, severity: string, message: string, cameraName: string) => {
    const response = await fetch("/api/alerts/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, severity, message, cameraName })
    });
    if (response.ok) syncDataWithBackend();
  };

  // Analyze webcam base64 frame
  const handleAnalyzeFrame = async (imageFrame: string, cameraSource: string) => {
    const response = await fetch("/api/ai/analyze-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageFrame, cameraSource })
    });
    if (!response.ok) {
      throw new Error("پردازش فریم عکس توسط سرور ناموفق بود.");
    }
    const result = await response.json();
    syncDataWithBackend();
    return result;
  };

  // Total active alerts badge
  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden" dir="rtl">
      
      {/* Top Application Bar */}
      <header className="h-16 bg-slate-900/50 border-b border-slate-800 px-8 flex justify-between items-center sticky top-0 z-40 backdrop-blur-md">
        
        {/* Brand details with glowing status */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <h1 className="text-sm font-bold text-white tracking-tight">سامانه جامع نظارت، امنیت و تردد هوشیار</h1>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5 tracking-wider font-mono">HUSH-YAR SENTINEL AI // SYSTEM ACTIVE</p>
          </div>
        </div>

        {/* Header center - System information */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
          <span className="text-slate-500">وضعیت پایگاه داده:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            متصل (زنده)
          </span>
          <div className="h-4 w-px bg-slate-850"></div>
          <span className="text-slate-500">نودهای فعال:</span>
          <span className="text-slate-300 font-mono">۴۲ دوربین / ۴ کارت پردازنده</span>
        </div>

        {/* Role Switcher & Interactive Context Banner */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <span className="text-[9px] text-slate-500 font-bold hidden sm:inline px-1">سطح شبیه‌ساز:</span>

          <div className="flex gap-1">
            <button 
              onClick={() => {
                setCurrentRole('admin');
                setActiveTab('dashboard');
              }}
              className={`px-2 py-1 rounded text-[9px] font-bold transition ${
                currentRole === 'admin' 
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              مدیر کل (Admin)
            </button>
            <button 
              onClick={() => {
                setCurrentRole('teacher');
                setActiveTab('classrooms');
              }}
              className={`px-2 py-1 rounded text-[9px] font-bold transition ${
                currentRole === 'teacher' 
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              دبیر (Teacher)
            </button>
            <button 
              onClick={() => {
                setCurrentRole('parent');
                setActiveTab('users');
              }}
              className={`px-2 py-1 rounded text-[9px] font-bold transition ${
                currentRole === 'parent' 
                  ? "bg-purple-600/20 text-purple-400 border border-purple-600/30 shadow-sm" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              اولیا (Parent)
            </button>
          </div>
        </div>

      </header>

      {/* Main Body Grid: Sidebar + Module Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Responsive Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900 md:border-l border-b md:border-b-0 border-slate-850 p-4 flex flex-col justify-between shrink-0">
          
          <div className="space-y-6">
            
            {/* Active User profile card in sidebar */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full border border-slate-750 flex items-center justify-center text-white text-xs font-bold ${
                currentRole === 'admin' ? "bg-blue-500/10 text-blue-400" :
                currentRole === 'teacher' ? "bg-emerald-500/10 text-emerald-400" :
                "bg-purple-500/10 text-purple-400"
              }`}>
                {currentRole === 'admin' ? "AD" :
                 currentRole === 'teacher' ? "TC" : "PT"}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">پروفایل جاری:</span>
                <span className="text-xs font-bold text-white block truncate">
                  {currentRole === 'admin' ? "مهندس خسروی (حراست)" :
                   currentRole === 'teacher' ? "دکتر حمیدی (پایه دهم)" : "علیرضا رضایی (ولی آرش)"}
                </span>
              </div>
            </div>

            {/* Menu List */}
            <div className="space-y-1">
              
              {/* Menu Item 1: Admin Dashboard (Hidden for parents) */}
              {currentRole !== 'parent' && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'dashboard' 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm font-bold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>داشبورد زنده مانیتورینگ</span>
                </button>
              )}

              {/* Menu Item 2: User Directory */}
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'users' 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm font-bold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>مدیریت کاربران و چهره‌ها</span>
              </button>

              {/* Menu Item 3: Attendance Logs */}
              <button
                onClick={() => setActiveTab('traffic')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'traffic' 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm font-bold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>گزارشات و لاگ‌های تردد</span>
              </button>

              {/* Menu Item 4: Classroom monitor (Hidden for parents) */}
              {currentRole !== 'parent' && (
                <button
                  onClick={() => setActiveTab('classrooms')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'classrooms' 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm font-bold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  }`}
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>نظارت هوشمند کلاس‌ها</span>
                </button>
              )}

              {/* Menu Item 5: AI Vision Lab (Admin Only) */}
              {currentRole === 'admin' && (
                <button
                  onClick={() => setActiveTab('aivision')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'aivision' 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-sm font-bold" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span>آزمایشگاه بینایی ماشین</span>
                  </div>
                  <span className="text-[8px] bg-blue-600/30 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/20">AI</span>
                </button>
              )}

            </div>
          </div>

          {/* Footer security badge */}
          <div className="hidden md:block pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <div className="text-[9px] text-slate-400 font-mono leading-none">
                <span className="font-bold">HEALTH: OPERATIONAL</span>
                <span className="block mt-1 text-[8px] text-slate-500 uppercase">GPU Farm // YOLO_V8</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Dynamic Panel Content Container */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* Real-time Alert Notification Banner */}
          {currentRole === 'admin' && (
            <AlertBanner 
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {/* Module Tab Routing */}
          <div className="transition-all duration-300">
            
            {activeTab === 'dashboard' && currentRole !== 'parent' && (
              <StatsDashboard 
                users={users}
                trafficLogs={trafficLogs}
                alerts={alerts}
                onAddTrafficSim={handleAddTrafficSim}
              />
            )}

            {activeTab === 'users' && (
              <UserManagement 
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                currentUserRole={currentRole}
                simulatedParentId={simulatedParentId}
              />
            )}

            {activeTab === 'traffic' && (
              <AttendanceLogs 
                users={users}
                trafficLogs={trafficLogs}
                onAddTrafficSim={handleAddTrafficSim}
                currentUserRole={currentRole}
                simulatedParentId={simulatedParentId}
              />
            )}

            {activeTab === 'classrooms' && currentRole !== 'parent' && (
              <ClassroomMonitoring 
                classrooms={classrooms}
                users={users}
                onUpdateClassroom={handleUpdateClassroom}
                currentUserRole={currentRole}
              />
            )}

            {activeTab === 'aivision' && currentRole === 'admin' && (
              <AiVisionLab 
                onAnalyzeFrame={handleAnalyzeFrame}
              />
            )}

          </div>

          {/* Quick Alarm simulation presets (Available only to Admins at the bottom) */}
          {currentRole === 'admin' && (
            <QuickSimulator 
              onSimulate={handleSimulateAlert}
            />
          )}

        </main>

      </div>

    </div>
  );
}
