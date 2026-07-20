import React, { useState } from "react";
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  UserPlus, 
  Camera, 
  UserCheck, 
  Filter,
  Check,
  AlertCircle,
  FileText
} from "lucide-react";
import { SchoolUser, UserRole } from "../types";

interface UserManagementProps {
  users: SchoolUser[];
  onAddUser: (user: any) => Promise<any>;
  onUpdateUser: (id: string, data: any) => Promise<any>;
  onDeleteUser: (id: string) => Promise<any>;
  currentUserRole: UserRole | 'admin';
  simulatedParentId: string | null;
}

export default function UserManagement({ 
  users, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  currentUserRole,
  simulatedParentId
}: UserManagementProps) {
  
  const [activeTab, setActiveTab] = useState<UserRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("student");
  const [formNationalId, setFormNationalId] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  // Specific role states
  const [formGrade, setFormGrade] = useState("دهم ریاضی");
  const [formClassRoom, setFormClassRoom] = useState("101");
  const [formParentId, setFormParentId] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formClasses, setFormClasses] = useState<string[]>(["101"]);
  const [formPosition, setFormPosition] = useState("");
  const [formChildId, setFormChildId] = useState("");

  // Filter users based on role permissions
  let permittedUsers = users;
  if (currentUserRole === "parent" && simulatedParentId) {
    // Parent only sees themselves and their child
    const parentUser = users.find(u => u.id === simulatedParentId);
    const childId = (parentUser as any)?.childId;
    permittedUsers = users.filter(u => u.id === simulatedParentId || u.id === childId);
  }

  // Filter based on UI Tab selection
  const filteredUsers = permittedUsers.filter(user => {
    const matchesTab = activeTab === 'all' || user.role === activeTab;
    const matchesSearch = user.name.includes(searchQuery) || 
                          user.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.nationalId.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  // Prebuilt sample avatar images for easier profile creation
  const sampleAvatars = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
  ];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formName || !formNationalId || !formPhone) {
      setErrorMsg("لطفاً تمام فیلدهای ستاره‌دار را پر کنید.");
      return;
    }

    if (formNationalId.length !== 10) {
      setErrorMsg("کد ملی باید دقیقاً ۱۰ رقم باشد.");
      return;
    }

    try {
      const payload: any = {
        name: formName,
        role: formRole,
        nationalId: formNationalId,
        phone: formPhone,
        photoUrl: formPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"
      };

      if (formRole === "student") {
        payload.grade = formGrade;
        payload.classRoom = formClassRoom;
        payload.parentId = formParentId;
      } else if (formRole === "teacher") {
        payload.subject = formSubject || "ریاضی";
        payload.classes = formClasses;
      } else if (formRole === "staff") {
        payload.position = formPosition || "کادر اجرایی";
      } else if (formRole === "parent") {
        payload.childId = formChildId;
      }

      await onAddUser(payload);
      setSuccessMsg("کاربر جدید با موفقیت ثبت شد و فریم‌های چهره ذخیره گردید.");
      
      // Reset form
      setFormName("");
      setFormNationalId("");
      setFormPhone("");
      setFormPhoto("");
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || "خطا در ثبت کاربر");
    }
  };

  return (
    <div className="space-y-6" id="user_crud_panel">
      
      {/* Top Controls: Search and Add New */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="جستجو با نام، کد ملی یا شناسه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Action Button: Register (Allowed only for Admins/Staff) */}
        {currentUserRole !== "parent" ? (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>ثبت‌نام و عضویت کاربر جدید</span>
          </button>
        ) : (
          <span className="text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>به علت دسترسی محدود اولیا، مجاز به ثبت نام کاربر جدید نیستید.</span>
          </span>
        )}
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 p-3.5 rounded-lg text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/40 border border-red-900 text-red-400 p-3.5 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registration Form Panel */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" id="user_add_form_box">
          <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              <span>پروفایل امنیتی و فرم بارگذاری مرجع تشخیص چهره</span>
            </h4>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white text-xs">بستن فرم ×</button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            
            {/* Core Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">نام و نام‌خانوادگی *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: علی علوی"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">کد ملی (۱۰ رقم) *</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={formNationalId}
                  onChange={(e) => setFormNationalId(e.target.value)}
                  placeholder="مثال: 0023456789"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">شماره تماس همراه *</label>
                <input 
                  type="text" 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="مثال: 09121234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">گروه و نقش کاربری *</label>
                <select 
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="student">دانش‌آموز (Student)</option>
                  <option value="teacher">دبیر / معلم (Teacher)</option>
                  <option value="staff">کادر اجرایی و آموزشی (Staff)</option>
                  <option value="parent">اولیای دانش‌آموز (Parent)</option>
                </select>
              </div>

            </div>

            {/* Role Specific Fields */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
              <p className="text-[10px] text-blue-400 font-bold mb-3">اطلاعات اختصاصی نقش انتخاب‌شده:</p>

              {formRole === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">پایه تحصیلی</label>
                    <input 
                      type="text" 
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      placeholder="مثال: دهم ریاضی"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">کلاس فیزیکی</label>
                    <input 
                      type="text" 
                      value={formClassRoom}
                      onChange={(e) => setFormClassRoom(e.target.value)}
                      placeholder="مثال: 101"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">کد ملی ولی مربوطه</label>
                    <select 
                      value={formParentId} 
                      onChange={(e) => setFormParentId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="">انتخاب ولی...</option>
                      {users.filter(u => u.role === "parent").map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formRole === "teacher" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">درس تخصصی تدریس</label>
                    <input 
                      type="text" 
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="مثال: ریاضی و دیفرانسیل"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1.5">کلاس‌های تحت پوشش</label>
                    <input 
                      type="text" 
                      placeholder="مثال: 101, 102"
                      value={formClasses.join(", ")}
                      onChange={(e) => setFormClasses(e.target.value.split(",").map(s => s.trim()))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {formRole === "staff" && (
                <div className="w-full md:w-1/2">
                  <label className="block text-slate-400 text-xs mb-1.5">سمت و عنوان شغلی</label>
                  <input 
                    type="text" 
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="مثال: ناظم پایه دهم / حراست درب شرقی"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              {formRole === "parent" && (
                <div className="w-full md:w-1/2">
                  <label className="block text-slate-400 text-xs mb-1.5">دانش‌آموز فرزند مربوطه</label>
                  <select 
                    value={formChildId} 
                    onChange={(e) => setFormChildId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">انتخاب فرزند...</option>
                    {users.filter(u => u.role === "student").map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            {/* Photo Scanner Simulation (Facial Reference) */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-blue-400 font-bold">عکس مرجع هوش مصنوعی (مرجع شناسایی چهره) *</p>
                <span className="text-[9px] text-slate-500">انتخاب تصویر نمونه یا آدرس دهی عکس</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-center">
                
                {/* Custom input or Preset selection */}
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    placeholder="آدرس اینترنتی تصویر پرسنلی پرتره یا فرمت بیس۶۴"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">انتخاب سریع نمونه:</span>
                    <div className="flex gap-2">
                      {sampleAvatars.map((src, i) => (
                        <button 
                          type="button"
                          key={i} 
                          onClick={() => setFormPhoto(src)}
                          className={`w-8 h-8 rounded-full border-2 overflow-hidden transition ${formPhoto === src ? "border-blue-500 scale-105" : "border-transparent"}`}
                        >
                          <img src={src} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Picture Preview */}
                <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {formPhoto ? (
                    <img src={formPhoto} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-700" />
                  )}
                </div>

              </div>
            </div>

            {/* Form Submit */}
            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-2 rounded-lg transition"
              >
                انصراف
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>بارگذاری چهره و اتمام ثبت‌نام</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Directory Tab List */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${activeTab === 'all' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          همه کاربران ({permittedUsers.length})
        </button>
        <button 
          onClick={() => setActiveTab('student')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${activeTab === 'student' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          دانش‌آموزان ({permittedUsers.filter(u => u.role === "student").length})
        </button>
        <button 
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${activeTab === 'teacher' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          معلمان و دبیران ({permittedUsers.filter(u => u.role === "teacher").length})
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${activeTab === 'staff' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          کادر اداری/اجرایی ({permittedUsers.filter(u => u.role === "staff").length})
        </button>
        <button 
          onClick={() => setActiveTab('parent')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${activeTab === 'parent' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          اولیا دانش‌آموزان ({permittedUsers.filter(u => u.role === "parent").length})
        </button>
      </div>

      {/* Users grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="user_list_grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
              id={`user_card_${user.id}`}
            >
              {/* User Identity Banner */}
              <div className="flex gap-3.5 items-start">
                <div className="w-14 h-14 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative">
                  <img 
                    src={user.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center">
                    <span className="text-[8px] font-semibold text-slate-300">{user.id}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      user.role === 'student' ? 'bg-blue-500/10 text-blue-400' :
                      user.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-400' :
                      user.role === 'staff' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {user.role === 'student' ? 'دانش‌آموز' :
                       user.role === 'teacher' ? 'دبیر آموزشی' :
                       user.role === 'staff' ? 'کادر اجرایی' : 'اولیای دانش‌آموز'}
                    </span>
                    
                    {/* Delete Icon (Admins/Staff only) */}
                    {currentUserRole !== "parent" && (
                      <button 
                        onClick={() => {
                          if (confirm(`آیا از حذف پروفایل "${user.name}" اطمینان دارید؟`)) {
                            onDeleteUser(user.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-500 p-1 rounded hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h5 className="text-sm font-semibold text-white mt-1.5 truncate">{user.name}</h5>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>کد ملی: {user.nationalId}</span>
                  </p>
                </div>
              </div>

              {/* Specific Metadata Fields */}
              <div className="bg-slate-950 rounded-lg p-2.5 mt-4 space-y-1.5 text-xs border border-slate-850">
                
                {user.role === "student" && (
                  <>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>کلاس و پایه:</span>
                      <span className="text-white font-medium">{(user as any).grade} / کلاس {(user as any).classRoom}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>شناسه ولی مربوطه:</span>
                      <span className="text-blue-400">{(user as any).parentId || "ثبت‌نشده"}</span>
                    </div>
                  </>
                )}

                {user.role === "teacher" && (
                  <>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>درس تخصصی:</span>
                      <span className="text-emerald-400 font-medium">{(user as any).subject}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>کلاس‌های فعال:</span>
                      <span className="text-white">{(user as any).classes?.join(" - ") || "هیچ"}</span>
                    </div>
                  </>
                )}

                {user.role === "staff" && (
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>عنوان و مسئولیت:</span>
                    <span className="text-amber-400">{(user as any).position}</span>
                  </div>
                )}

                {user.role === "parent" && (
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>فرزند تحت تکفل:</span>
                    <span className="text-purple-400 font-medium">{(user as any).childId || "ناشناس"}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 text-[9px] pt-1 border-t border-slate-900">
                  <span>شماره موبایل:</span>
                  <span>{user.phone}</span>
                </div>

              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">هیچ کاربر منطبق با فیلترها و کلمه‌ی جستجوی شما یافت نشد.</p>
          </div>
        )}
      </div>

    </div>
  );
}
