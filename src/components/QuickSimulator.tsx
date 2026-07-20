import React from "react";
import { 
  Zap, 
  ShieldAlert, 
  UserX, 
  HeartCrack, 
  Clock, 
  Sword,
  ShieldAlert as AlertIcon
} from "lucide-react";

interface QuickSimulatorProps {
  onSimulate: (type: string, severity: string, message: string, cameraName: string) => void;
}

export default function QuickSimulator({ onSimulate }: QuickSimulatorProps) {
  
  const simulationPresets = [
    {
      label: "ورود فرد غریبه 👤",
      type: "unknown_face",
      severity: "medium",
      message: "هشدار: عبور فرد ناشناس فاقد کارت هوشمند و نشان پرسنلی در محوطه حیاط اصلی",
      camera: "CCTV حیاط غربی",
      color: "from-blue-600 to-indigo-600"
    },
    {
      label: "کشف شیء جنگی/سلاح ⚠️",
      type: "weapon_detected",
      severity: "critical",
      message: "هشدار فوق امنیتی: پردازشگر ویدئویی سلاح سرد (چاقوی پروانه‌ای) در دست فرد متفرقه را ردگیری کرد!",
      camera: "گیت اصلی دانش‌آموزان",
      color: "from-red-600 to-rose-600"
    },
    {
      label: "نزاع و درگیری فیزیکی 👊",
      type: "fight_detected",
      severity: "high",
      message: "هشدار رفتار تهاجمی: نزاع فیزیکی شدید و تجمع دانش‌آموزان در پشت ساختمان کلاس‌ها",
      camera: "CCTV حیاط پشتی",
      color: "from-orange-600 to-red-600"
    },
    {
      label: "سقوط دانش‌آموز (Fall) 🚑",
      type: "fall_detected",
      severity: "high",
      message: "فوریت پزشکی: سقوط ناگهانی آرش رضایی روی زمین حیاط ورودی و عدم واکنش حرکتی!",
      camera: "دوربین ورودی اصلی",
      color: "from-purple-600 to-indigo-600"
    },
    {
      label: "تاخیر دبیر فیزیک ⏳",
      type: "teacher_late",
      severity: "medium",
      message: "هشدار مانیتورینگ کلاس: کلاس ۱۰۳ با پایه دوازدهم انسانی فاقد معلم بوده و تاخیر دبیر بیش از ۱۰ دقیقه است.",
      camera: "دوربین راهرو طبقه اول",
      color: "from-amber-600 to-yellow-600"
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" id="quick_simulator_panel">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>پنل تست سریع و شبیه‌سازی حوادث امنیتی مدرسه (Admin Stress Test)</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">برای آزمایش آژیرها و بنرهای اضطراری سیستم، روی دکمه‌های زیر کلیک کنید:</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="quick_sim_buttons_grid">
        {simulationPresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onSimulate(preset.type, preset.severity, preset.message, preset.camera)}
            className={`bg-gradient-to-br ${preset.color} hover:brightness-110 active:scale-95 text-white font-bold text-xs p-3 rounded-lg shadow-md transition flex flex-col items-center justify-center text-center gap-2 h-20`}
          >
            <ShieldAlert className="w-5 h-5 opacity-90" />
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
