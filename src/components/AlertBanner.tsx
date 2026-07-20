import React, { useState } from "react";
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Check, 
  BellRing,
  ShieldAlert,
  HeartCrack,
  Clock,
  UserCheck
} from "lucide-react";
import { SecurityAlert } from "../types";
import { playSiren, stopSiren } from "./SirenSynthesizer";

interface AlertBannerProps {
  alerts: SecurityAlert[];
  onResolveAlert: (id: string) => void;
}

export default function AlertBanner({ alerts, onResolveAlert }: AlertBannerProps) {
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const activeAlerts = alerts.filter(a => !a.resolved);

  // Toggle synthesized audio alarm
  const handleToggleSiren = () => {
    if (sirenPlaying) {
      stopSiren();
      setSirenPlaying(false);
    } else {
      playSiren();
      setSirenPlaying(true);
    }
  };

  // Auto trigger/stop siren if critical alerts change
  const criticalCount = activeAlerts.filter(a => a.severity === "high" || a.severity === "critical").length;

  React.useEffect(() => {
    if (criticalCount > 0 && !sirenPlaying) {
      playSiren();
      setSirenPlaying(true);
    } else if (criticalCount === 0 && sirenPlaying) {
      stopSiren();
      setSirenPlaying(false);
    }
    return () => {
      stopSiren();
    };
  }, [criticalCount]);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-3" id="alerts_notification_hub">
      
      {/* Top flashing banner if critical alarms are active */}
      {criticalCount > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg ring-1 ring-red-500/20 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 rounded text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>هشدار فوق‌العاده امنیتی فعال است!</span>
                <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded font-mono border border-red-500/30">{criticalCount} critical</span>
              </h4>
              <p className="text-xs text-red-300 mt-1">ترافیک تهدید بالا شناسایی شد. حراست فیزیکی فوراً مطلع شود.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleToggleSiren}
              className={`text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition ${
                sirenPlaying 
                  ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" 
                  : "bg-red-600/25 text-red-400 border border-red-500/30"
              }`}
            >
              {sirenPlaying ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>قطع صدای آژیر بحران</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 animate-ping" />
                  <span>پخش صدای آژیر بحران</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Accordion alert lists */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-amber-500" />
            <span>اعلانات فعال راهروها و فضاهای باز ({activeAlerts.length})</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">AUTOMATED DETECTIONS</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {activeAlerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-3 rounded bg-slate-950/80 border border-slate-850 border-r-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                alert.severity === "critical" || alert.severity === "high"
                  ? "border-r-red-500 text-slate-200"
                  : "border-r-amber-500 text-slate-200"
              }`}
              id={`alert_banner_${alert.id}`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
                <div>
                  <p className="text-xs font-semibold">{alert.message}</p>
                  <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                    <span>محل ثبت: <strong className="text-white">{alert.cameraName}</strong></span>
                    <span>ساعت ثبت: {new Date(alert.timestamp).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
                {alert.imageUrl && (
                  <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded text-blue-400 border border-blue-500/10">
                    📸 فریم عکاسی پیوست شد
                  </span>
                )}
                <button 
                  onClick={() => onResolveAlert(alert.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded transition flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>رفع وضعیت بحرانی</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
