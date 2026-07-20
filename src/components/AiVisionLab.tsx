import React, { useRef, useState, useEffect } from "react";
import { 
  Camera, 
  RefreshCw, 
  AlertOctagon, 
  Zap, 
  ShieldCheck, 
  UserX, 
  Flame, 
  Eye, 
  Sliders,
  Video,
  Monitor,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";

interface AiVisionLabProps {
  onAnalyzeFrame: (base64Image: string, cameraName: string) => Promise<any>;
}

export default function AiVisionLab({ onAnalyzeFrame }: AiVisionLabProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraSource, setCameraSource] = useState("دوربین ورودی اصلی");
  
  // Simulation Presets
  const presets = [
    {
      id: "normal",
      name: "کلاس درس عادی (معمولی)",
      imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&auto=format&fit=crop&q=60",
      camera: "دوربین کلاس ۱۰۱"
    },
    {
      id: "weapon",
      name: "شبیه‌سازی چاقو / سلاح سرد ⚠️",
      imageUrl: "https://images.unsplash.com/photo-1594142429074-a46b1418ef0e?w=500&auto=format&fit=crop&q=60",
      camera: "دوربین ۱ - آزمایش سلاح"
    },
    {
      id: "fall",
      name: "شبیه‌سازی سقوط و حال بد پزشکی 🚑",
      imageUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=500&auto=format&fit=crop&q=60",
      camera: "دوربین ۲ - شبیه‌ساز افتادن"
    },
    {
      id: "fight",
      name: "شبیه‌سازی دعوا و درگیری فیزیکی 👊",
      imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500&auto=format&fit=crop&q=60",
      camera: "دوربین ۳ - درگیری فیزیکی"
    },
    {
      id: "stranger",
      name: "شبیه‌سازی فرد ناشناس فاقد کارت 👥",
      imageUrl: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=500&auto=format&fit=crop&q=60",
      camera: "دوربین گیت ورودی اصلی"
    }
  ];

  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [usePreset, setUsePreset] = useState(true);

  // AI Response state
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Turn on/off webcam
  const startWebcam = async () => {
    try {
      setUsePreset(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setWebcamActive(true);
    } catch (err) {
      console.warn("Failed to open webcam, falling back to preset mode.", err);
      alert("خطا در باز کردن وبکم. به حالت شبیه‌ساز دوربین تغییر داده شد.");
      setUsePreset(true);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Helper to convert Unsplash image URL to base64 for prompt transmission
  const convertUrlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Capture frame & analyze
  const handleAnalyzeFrame = async () => {
    setLoading(true);
    try {
      let base64Image = "";
      let targetCamera = cameraSource;

      if (usePreset) {
        // Preset mode
        base64Image = await convertUrlToBase64(selectedPreset.imageUrl);
        targetCamera = selectedPreset.camera;
      } else {
        // Real webcam capture
        if (videoRef.current) {
          const canvas = document.createElement("canvas");
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            base64Image = canvas.toDataURL("image/png");
          }
        }
      }

      if (!base64Image) {
        throw new Error("خطا در کپچر کردن تصویر دوربین");
      }

      // Call API
      const result = await onAnalyzeFrame(base64Image, targetCamera);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error(err);
      alert("خطا در دریافت پاسخ از هوش مصنوعی: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="ai_vision_lab_panel">
      
      {/* Informative description */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>آزمایشگاه هوش مصنوعی و پردازش تصویر ثبات (Computer Vision Lab)</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          در این بخش می‌توانید وبکم دستگاه خود را به عنوان دوربین مداربسته فعال کنید، یا از طریق تصاویر مرجع پیش‌فرض حوادث بحرانی (سلاح سرد، سقوط بیمار، نزاع خیابانی) را شبیه‌سازی کرده و پردازش بی‌درنگ مدل Gemini را آزمایش کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Camera monitor (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-between" id="cctv_frame_box">
          
          {/* Monitor top bar */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-850 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Video className="w-4 h-4 text-pink-500" />
              <span>دوربین فعال: {usePreset ? selectedPreset.camera : cameraSource}</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setUsePreset(true);
                  stopWebcam();
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold transition ${
                  usePreset ? "bg-pink-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                شبیه‌ساز تصویر
              </button>
              <button 
                onClick={startWebcam}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold transition ${
                  webcamActive ? "bg-pink-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                وبکم لپ‌تاپ (زنده)
              </button>
            </div>
          </div>

          {/* CCTV Feed Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            
            {/* Overlay grid lines for security aesthetics */}
            <div className="absolute inset-0 border-2 border-slate-900/30 pointer-events-none z-10"></div>
            <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 rounded text-[9px] text-emerald-400 font-mono tracking-widest z-10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>LIVE CCTV FEED</span>
            </div>

            {/* If loading, show glowing scanning line */}
            {loading && (
              <div className="absolute inset-x-0 h-1 bg-blue-500 opacity-80 animate-bounce shadow-[0_0_15px_#3b82f6] z-20"></div>
            )}

            {/* Video Feed / Preset Image */}
            {usePreset ? (
              <img 
                src={selectedPreset.imageUrl} 
                alt="Preset Sim" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <video 
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
            )}

            {/* Simulated Bounding Box Overlay based on actual AI analysis result */}
            {analysisResult && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className={`absolute border-2 w-36 h-48 rounded transition-all duration-500 ${
                  analysisResult.analysis?.alertSeverity === "critical" || analysisResult.analysis?.alertSeverity === "high"
                    ? "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] top-[25%] right-[30%] sm:right-[35%]"
                    : "border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] top-[20%] right-[35%] sm:right-[40%]"
                }`}>
                  <span className={`absolute -top-5 right-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm ${
                    analysisResult.analysis?.alertSeverity === "critical" || analysisResult.analysis?.alertSeverity === "high"
                      ? "bg-red-600 text-white"
                      : "bg-green-500 text-slate-950"
                  }`}>
                    {analysisResult.analysis?.detectedObjects?.[0] || "OBJECT"} // {analysisResult.analysis?.alertSeverity === 'critical' ? 'DANGER' : 'SECURE'}
                  </span>
                </div>
              </div>
            )}

            {/* No active video prompt */}
            {!webcamActive && !usePreset && (
              <div className="text-center text-slate-500 space-y-2">
                <Camera className="w-10 h-10 mx-auto opacity-50" />
                <p className="text-xs">دوربین غیرفعال است. وبکم را روشن کنید یا شبیه‌ساز را انتخاب کنید.</p>
              </div>
            )}

          </div>

          {/* Bottom Settings controls */}
          <div className="p-4 bg-slate-900 border-t border-slate-850">
            {usePreset ? (
              <div className="space-y-2">
                <label className="block text-slate-400 text-[10px] font-bold">انتخاب سناریو و حادثه شبیه‌سازی شده:</label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedPreset(p)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border transition ${
                        selectedPreset.id === p.id 
                          ? "bg-pink-600/15 text-pink-400 border-pink-600/30 shadow-sm" 
                          : "bg-slate-950 text-slate-400 border-slate-850 hover:text-white"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <label className="text-slate-400 text-xs font-semibold whitespace-nowrap">انتخاب محل نصب دوربین وبکم:</label>
                <select 
                  value={cameraSource}
                  onChange={(e) => setCameraSource(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white flex-1"
                >
                  <option value="درب ورودی اصلی">وبکم گیت ورودی دانش‌آموزان</option>
                  <option value="کلاس ۱۰۱">وبکم راهرو کلاس ۱۰۱</option>
                  <option value="حیاط غربی">وبکم حیاط اصلی</option>
                </select>
              </div>
            )}

            {/* Scan button */}
            <button 
              onClick={handleAnalyzeFrame}
              disabled={loading || (!webcamActive && !usePreset)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال پردازش فریم با هوش مصنوعی...</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>پردازش تصویر دوربین (انتقال به پردازشگر هوشمند)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right column: Diagnostics HUD (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between" id="ai_diagnostics_hud">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full flex flex-col">
            <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>نتایج مانیتورینگ بینایی ماشین (AI Diagnostics)</span>
            </h4>

            {analysisResult ? (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Threat level alert box */}
                <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                  analysisResult.analysis?.alertSeverity === "critical" || analysisResult.analysis?.alertSeverity === "high"
                    ? "bg-red-950/20 border-red-900 text-red-400"
                    : analysisResult.analysis?.alertSeverity === "medium"
                    ? "bg-amber-950/20 border-amber-900 text-amber-500"
                    : "bg-emerald-950/20 border-emerald-900 text-emerald-400"
                }`}>
                  <AlertOctagon className="w-8 h-8 shrink-0" />
                  <div>
                    <span className="text-[10px] block opacity-75">سطح خطر دوربین (Threat Severity)</span>
                    <h5 className="text-sm font-bold mt-0.5">
                      {analysisResult.analysis?.alertSeverity === "critical" ? "بحرانی / تماس فوری با حراست" :
                       analysisResult.analysis?.alertSeverity === "high" ? "هشدار بالا / نیاز به مداخله کادر" :
                       analysisResult.analysis?.alertSeverity === "medium" ? "متوسط / گزارش تردد مشکوک" : "عادی / بدون تهدید"}
                    </h5>
                  </div>
                </div>

                {/* Detected Objects with tags */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block">اشیاء و موارد شناسایی شده:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.analysis?.detectedObjects?.length > 0 ? (
                      analysisResult.analysis.detectedObjects.map((obj: string, i: number) => (
                        <span key={i} className="text-xs bg-slate-950 border border-slate-850 px-2 py-1 rounded text-slate-300 font-mono">
                          🔍 {obj}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">موردی یافت نشد.</span>
                    )}
                  </div>
                </div>

                {/* Anomaly Checklist */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>حضور فرد غریبه / تایید نشده:</span>
                    <span className={analysisResult.analysis?.isStranger ? "text-red-500 font-bold" : "text-emerald-400"}>
                      {analysisResult.analysis?.isStranger ? "بله" : "خیر"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>حمل سلاح (سلاح سرد/گرم):</span>
                    <span className={analysisResult.analysis?.isWeaponDetected ? "text-red-500 font-bold" : "text-emerald-400"}>
                      {analysisResult.analysis?.isWeaponDetected ? "⚠️ شناسایی شد" : "خیر"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>درگیری و نزاع فیزیکی:</span>
                    <span className={analysisResult.analysis?.isFightDetected ? "text-red-500 font-bold" : "text-emerald-400"}>
                      {analysisResult.analysis?.isFightDetected ? "⚠️ شناسایی شد" : "خیر"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>سقوط بیمار روی زمین (Fall):</span>
                    <span className={analysisResult.analysis?.isFallDetected ? "text-red-500 font-bold" : "text-emerald-400"}>
                      {analysisResult.analysis?.isFallDetected ? "🚑 مصدومیت شناسایی شد" : "خیر"}
                    </span>
                  </div>
                </div>

                {/* Gemini Farsi Description */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1.5">
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>گزارش توصیفی هوش مصنوعی (فارسی):</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {analysisResult.analysis?.description || "وضعیت عادی تشخیص داده شد."}
                  </p>
                </div>

                {/* Core metadata info */}
                <div className="text-[9px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between">
                  <span>منبع پردازش: {analysisResult.source}</span>
                  <span>کد پاسخ: SUCCESS</span>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <Monitor className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs">درخواست آنالیز فریم ارسال نشده است.</p>
                <p className="text-[10px] text-slate-600 mt-1">با کلیک روی دکمه پردازش تصویر، آنالیز دقیق هوش مصنوعی را دریافت کنید.</p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
