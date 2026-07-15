import { useState } from "react";
import { useApp } from "../store";
import { APP_VERSION, APP_BUILD } from "../types";
import {
  User, Edit3, Ruler, Weight, Cake, Heart, Info, Shield,
  Mail, Calendar, Sparkles, LogOut, BadgeCheck, Save, X,
} from "lucide-react";

const AVATAR_COLORS = [
  { key: "orange", color: "#FF8C42", bg: "bg-warm-orange" },
  { key: "blue", color: "#5B8FCF", bg: "bg-soft-blue" },
  { key: "green", color: "#6DC77A", bg: "bg-mint-green" },
  { key: "purple", color: "#9B8FD4", bg: "bg-purple-soft" },
  { key: "pink", color: "#F472B6", bg: "bg-pink-400" },
  { key: "teal", color: "#2DD4BF", bg: "bg-teal-400" },
];

function calcBMI(weight: number, heightCm: number) {
  if (!weight || !heightCm) return null;
  const h = heightCm / 100;
  return (weight / (h * h)).toFixed(1);
}

function getBMILevel(bmi: number) {
  if (bmi < 18.5) return { label: "偏瘦", color: "#5B8FCF" };
  if (bmi < 24) return { label: "标准", color: "#6DC77A" };
  if (bmi < 28) return { label: "偏胖", color: "#FF8C42" };
  return { label: "肥胖", color: "#EF4444" };
}

export default function ProfilePage() {
  const { user, profile, updateProfile, updateNickname, logout, getStats, habits, records } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const stats = getStats();
  const bmi = calcBMI(form.weight, form.height);
  const avatarColor = AVATAR_COLORS.find(c => c.key === form.avatar) || AVATAR_COLORS[0];
  const joinedDays = user ? Math.ceil((Date.now() - new Date(user.joinedAt).getTime()) / 86400000) : 0;

  const handleSave = () => {
    updateProfile(form);
    if (form.nickname !== user?.name) {
      updateNickname(form.nickname);
    }
    setEditing(false);
  };

  const InfoRow = ({ icon: Icon, label, value, color }: { icon: typeof User; label: string; value: string | number; color?: string }) => (
    <div className="flex items-center justify-between py-3 px-1 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-dark-brown" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-dark-brown">我的</h1>
        <p className="text-sm text-gray-400 mt-0.5">个人中心</p>
      </div>

      {/* ── Avatar card ── */}
      <div className="mp-card overflow-hidden">
        {/* Top gradient */}
        <div className="h-24 bg-gradient-to-br from-warm-orange to-warm-orange-dark relative">
          <button
            onClick={() => setEditing(true)}
            className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur rounded-xl text-white hover:bg-white/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-5 pb-5 -mt-10 relative">
          <div
            className={`w-20 h-20 rounded-[22px] ${avatarColor.bg} flex items-center justify-center border-4 border-white shadow-lg`}
          >
            <span className="text-2xl font-extrabold text-white">
              {(profile.nickname || user?.name || "?").slice(0, 1)}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-dark-brown">{profile.nickname || user?.name}</h2>
              <BadgeCheck className="w-5 h-5 text-soft-blue" />
            </div>
            {profile.bio ? (
              <p className="text-sm text-gray-400 mt-0.5">{profile.bio}</p>
            ) : (
              <p className="text-sm text-gray-300 mt-0.5 italic">写一句个性签名...</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Body data cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mp-card p-4 text-center">
          <Ruler className="w-5 h-5 text-gray-300 mx-auto mb-1.5" />
          <div className="text-lg font-bold text-dark-brown">{profile.height || "-"}</div>
          <div className="text-[11px] text-gray-400">身高 (cm)</div>
        </div>
        <div className="mp-card p-4 text-center">
          <Weight className="w-5 h-5 text-gray-300 mx-auto mb-1.5" />
          <div className="text-lg font-bold text-dark-brown">{profile.weight || "-"}</div>
          <div className="text-[11px] text-gray-400">体重 (kg)</div>
        </div>
        <div className="mp-card p-4 text-center">
          <Heart className="w-5 h-5 text-gray-300 mx-auto mb-1.5" />
          <div>
            <span className="text-lg font-bold" style={{ color: bmi ? getBMILevel(parseFloat(bmi)).color : "#3D3D3D" }}>
              {bmi || "-"}
            </span>
          </div>
          <div className="text-[11px] text-gray-400">
            BMI {bmi ? getBMILevel(parseFloat(bmi)).label : ""}
          </div>
        </div>
      </div>

      {/* ── Account info ── */}
      <div className="mp-card p-5">
        <h3 className="text-sm font-semibold text-dark-brown mb-1">账号信息</h3>
        <InfoRow icon={User} label="昵称" value={profile.nickname || user?.name || "-"} />
        <InfoRow icon={Cake} label="生日" value={profile.birthday || "未设置"} />
        <InfoRow icon={Calendar} label="加入天数" value={`${joinedDays} 天`} />
        <InfoRow icon={Sparkles} label="累计打卡" value={`${stats.totalCheckIns} 次`} />
        <InfoRow icon={Weight} label="BMI 指数" value={bmi ? `${bmi} (${getBMILevel(parseFloat(bmi)).label})` : "-"} color={bmi ? getBMILevel(parseFloat(bmi)).color : undefined} />
      </div>

      {/* ── App info ── */}
      <div className="mp-card p-5">
        <h3 className="text-sm font-semibold text-dark-brown mb-1">关于</h3>
        <InfoRow icon={Info} label="版本号" value={`v${APP_VERSION}`} />
        <InfoRow icon={Calendar} label="构建日期" value={APP_BUILD} />
        <InfoRow icon={Shield} label="隐私政策" value="查看 >" />
        <InfoRow icon={Mail} label="联系我们" value="feedback@habit.com" />
      </div>

      {/* ── Danger zone ── */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-400 text-sm font-medium hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        退出登录
      </button>

      <div className="text-center pb-8">
        <p className="text-xs text-gray-300">TRAE AI 创造力大赛 · 社会公益赛道</p>
      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditing(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-brown">编辑资料</h2>
              <button onClick={() => setEditing(false)} className="p-1.5 text-gray-300 hover:text-gray-600 rounded-xl hover:bg-gray-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Avatar color picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">头像颜色</label>
                <div className="flex gap-2.5">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setForm({ ...form, avatar: c.key })}
                      className={`w-10 h-10 rounded-xl ${c.bg} transition-all ${
                        form.avatar === c.key ? "ring-3 ring-offset-2 ring-gray-300 scale-110" : "opacity-50 hover:opacity-80"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">昵称</label>
                <input type="text" value={form.nickname} maxLength={12}
                  onChange={e => setForm({ ...form, nickname: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">个性签名</label>
                <input type="text" value={form.bio} maxLength={30} placeholder="写一句话介绍自己..."
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown placeholder-gray-300 focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5" />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">性别</label>
                <div className="flex gap-2">
                  {(["", "男", "女"] as const).map(g => (
                    <button key={g}
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        form.gender === g ? "bg-dark-brown text-white shadow-lg" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>
                      {g || "保密"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">生日</label>
                <input type="date" value={form.birthday}
                  onChange={e => setForm({ ...form, birthday: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5" />
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">身高 (cm)</label>
                  <input type="number" value={form.height || ""} min={50} max={250}
                    onChange={e => setForm({ ...form, height: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">体重 (kg)</label>
                  <input type="number" value={form.weight || ""} min={20} max={300}
                    onChange={e => setForm({ ...form, weight: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5" />
                </div>
              </div>

              {/* Save */}
              <button onClick={handleSave}
                disabled={!form.nickname.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white font-semibold rounded-2xl transition-all disabled:opacity-30 shadow-lg shadow-warm-orange/20 active:scale-[0.98]">
                <Save className="w-4 h-4" />
                保存资料
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
