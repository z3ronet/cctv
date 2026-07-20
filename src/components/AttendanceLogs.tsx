import React, { useState } from "react";
import { 
  Check, 
  Clock, 
  X, 
  Calendar, 
  Filter, 
  Search, 
  Radio, 
  HelpCircle,
  PlusCircle,
  TrendingUp,
  MapPin
} from "lucide-react";
import { TrafficLog, SchoolUser, UserRole } from "../types";

interface AttendanceLogsProps {
  users: SchoolUser[];
  trafficLogs: TrafficLog[];
  onAddTrafficSim: (userId: string, type: 'in' | 'out', cameraName?: string) => void;
  currentUserRole: UserRole | 'admin';
  simulatedParentId: string | null;
}

export default function AttendanceLogs({ 
  users, 
  trafficLogs, 
  onAddTrafficSim,
  currentUserRole,
  simulatedParentId
}: AttendanceLogsProps) {
  
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForSim, setSelectedUserForSim] = useState("");
  const [selectedTypeForSim, setSelectedTypeForSim] = useState<'in' | 'out'>('in');
  const [selectedCameraForSim, setSelectedCameraForSim] = useState("درب ورودی اصلی");

  // Filter based on parent access
  let permittedLogs = trafficLogs;
  if (currentUserRole === "parent" && simulatedParentId) {
    const parentUser = users.find(u => u.id === simulatedParentId);
    const childId = (parentUser as any)?.childId;
    permittedLogs = trafficLogs.filter(log => log.userId === simulatedParentId || log.userId === childId);
  }

  // Filter lists
  const filteredLogs = permittedLogs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesRole = filterRole === 'all' || log.userRole === filterRole;
    const matchesSearch = log.userName.includes(searchQuery) || log.userId.includes(searchQuery);
    return matchesType && matchesRole && matchesSearch;
  });

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSim) return;
    onAddTrafficSim(selectedUserForSim, selectedTypeForSim, selectedCameraForSim);
  };

  // Stats
  const totalScans = filteredLogs.length;
  const inScans = filteredLogs.filter(l => l.type === 'in').length;
  const outScans = filteredLogs.filter(l => l.type === 'out').length;
  const lateScans = filteredLogs.filter(l => l.status === 'late').length;

  const formatDateString = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return "امروز";
    }
  };

  const formatTimeString = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (e) {
      return "00:00:00";
    }
  };

  return (
    <div className="space-y-6" id="attendance_logs_panel">
      
      {/* Simulation Trigger Box (Admin Only) */}
      {currentUserRole !== "parent" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4" id="log_simulation_control">
          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>شبیه‌ساز گیت اسکن تشخیص چهره (تست عبور و مرور زنده)</span>
          </h4>
          
          <form onSubmit={handleSimulateScan} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">انتخاب کاربر برای شبیه‌سازی عبور:</label>
              <select 
                value={selectedUserForSim}
                onChange={(e) => setSelectedUserForSim(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="">انتخاب فرد...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.id} - {u.role === "student" ? "دانش‌آموز" : "معلم/پرسنل"})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">نوع تردد:</label>
              <select 
                value={selectedTypeForSim}
                onChange={(e) => setSelectedTypeForSim(e.target.value as 'in' | 'out')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="in">ورود (In)</option>
                <option value="out">خروج (Out)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] mb-1">دوربین گیت ورودی:</label>
              <select 
                value={selectedCameraForSim}
                onChange={(e) => setSelectedCameraForSim(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
              >
                <option value="گیت ورودی اصلی">گیت اصلی دانش‌آموزان</option>
                <option value="گیت اسکنر اساتید">گیت پرسنل و اساتید</option>
                <option value="گیت پارکینگ">درب پارکینگ خودرویی</option>
                <option value="دوربین محوطه حیاط غربی">وبکم نظارتی محوطه</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={!selectedUserForSim}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition h-[34px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>ارسال کارت اسکن چهره</span>
            </button>
          </form>
        </div>
      )}

      {/* Traffic statistics banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400">کل رویدادهای تردد امروز</span>
          <p className="text-xl font-bold text-white mt-1">{totalScans} اسکن چهره</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400">تعداد ورودی‌ها (In)</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">{inScans} نفر</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400">تعداد خروجی‌ها (Out)</span>
          <p className="text-xl font-bold text-pink-400 mt-1">{outScans} نفر</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl">
          <span className="text-[10px] text-slate-400">ورودهای با تأخیر (Late)</span>
          <p className="text-xl font-bold text-amber-500 mt-1">{lateScans} تاخیر</p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Tab Filters */}
        <div className="flex gap-1 border-b border-slate-800 w-full md:w-auto">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition ${filterType === 'all' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            همه ترددها
          </button>
          <button 
            onClick={() => setFilterType('in')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition ${filterType === 'in' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            فقط ورودها
          </button>
          <button 
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition ${filterType === 'out' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            فقط خروج‌ها
          </button>
        </div>

        {/* Dropdown Role filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
            >
              <option value="all">فیلتر نقش: همه</option>
              <option value="student">دانش‌آموزان</option>
              <option value="teacher">دبیران</option>
              <option value="staff">کادر اجرایی</option>
              <option value="parent">اولیا</option>
            </select>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="جستجوی اسکن‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white pl-8 pr-3"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          </div>
        </div>

      </div>

      {/* Traffic log table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" id="attendance_logs_table_box">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-850">
              <tr>
                <th className="p-3.5">کاربر اسکن‌شده</th>
                <th className="p-3.5">نقش</th>
                <th className="p-3.5">ساعت اسکن</th>
                <th className="p-3.5">تاریخ ثبت</th>
                <th className="p-3.5">گیت / دوربین</th>
                <th className="p-3.5 text-center">نوع عبور</th>
                <th className="p-3.5 text-center">وضعیت تاخیر</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-850">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const matchedUser = users.find(u => u.id === log.userId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-850 transition" id={`log_row_${log.id}`}>
                      {/* User and ID */}
                      <td className="p-3.5 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <img 
                            src={matchedUser?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                            alt={log.userName} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="block font-bold">{log.userName}</span>
                            <span className="text-[10px] text-slate-500">{log.userId}</span>
                          </div>
                        </div>
                      </td>

                      {/* User Role */}
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          log.userRole === "student" ? "bg-blue-500/10 text-blue-400" :
                          log.userRole === "teacher" ? "bg-emerald-500/10 text-emerald-400" :
                          log.userRole === "staff" ? "bg-amber-500/10 text-amber-400" :
                          "bg-purple-500/10 text-purple-400"
                        }`}>
                          {log.userRole === "student" ? "دانش‌آموز" :
                           log.userRole === "teacher" ? "دبیر" :
                           log.userRole === "staff" ? "کادر اجرایی" : "ولی"}
                        </span>
                      </td>

                      {/* Scan Time */}
                      <td className="p-3.5 font-mono text-white text-[11px] font-semibold">
                        {formatTimeString(log.timestamp)}
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {formatDateString(log.timestamp)}
                      </td>

                      {/* Camera Location */}
                      <td className="p-3.5 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{log.cameraName}</span>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === "in" 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                            : "bg-pink-500/20 text-pink-400 border border-pink-500/20"
                        }`}>
                          {log.type === "in" ? "ورود ←" : "خروج →"}
                        </span>
                      </td>

                      {/* Lateness Status */}
                      <td className="p-3.5 text-center">
                        {log.status === "normal" && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                            <Check className="w-3.5 h-3.5" />
                            <span>مجاز/به‌موقع</span>
                          </span>
                        )}
                        {log.status === "late" && (
                          <span className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>تاخیر ثبت‌شده</span>
                          </span>
                        )}
                        {log.status === "unauthorized" && (
                          <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-bold">
                            <X className="w-3.5 h-3.5" />
                            <span>هشدار ورود</span>
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-semibold">
                    هیچ داده ترددی بر اساس فیلترهای بالا یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
