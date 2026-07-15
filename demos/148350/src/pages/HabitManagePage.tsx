import { useState } from "react";
import { useApp } from "../store";
import type { Habit } from "../types";
import Icon, { HABIT_ICON_OPTIONS, CATEGORY_ICON_KEYS } from "../components/Icon";
import { Plus, X, Edit3, Trash2, Save, BookOpen, Dumbbell, Sun, Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORIES: { value: Habit["category"]; label: string; icon: LucideIcon; color: string }[] = [
  { value: "学习", label: "学习", icon: BookOpen, color: "#5B8FCF" },
  { value: "运动", label: "运动", icon: Dumbbell, color: "#FF8C42" },
  { value: "生活", label: "生活", icon: Sun, color: "#6DC77A" },
  { value: "心理", label: "心理", icon: Brain, color: "#9B8FD4" },
];
const FREQUENCIES: Habit["frequency"][] = ["每天", "每周3次", "每周5次"];

export default function HabitManagePage() {
  const { habits, addHabit, updateHabit, deleteHabit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState<Omit<Habit, "id" | "createdAt">>({
    name: "", category: "学习", frequency: "每天", reminderTime: "08:00",
    color: "#5B8FCF", icon: "book",
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", category: "学习", frequency: "每天", reminderTime: "08:00", color: "#5B8FCF", icon: "book" });
    setShowForm(true);
  };
  const openEdit = (h: Habit) => {
    setEditing(h);
    setForm({ name: h.name, category: h.category, frequency: h.frequency, reminderTime: h.reminderTime, color: h.color, icon: h.icon });
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) { updateHabit({ ...editing, ...form }); }
    else { addHabit(form); }
    setShowForm(false);
  };

  const setCategory = (cat: Habit["category"]) => {
    const catInfo = CATEGORIES.find(c => c.value === cat)!;
    const iconKey = CATEGORY_ICON_KEYS[cat] || "book";
    setForm({ ...form, category: cat, color: catInfo.color, icon: iconKey });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark-brown">习惯管理</h1>
          <p className="text-sm text-gray-400 mt-0.5">{habits.length} 个习惯</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white font-medium rounded-2xl transition-all shadow-lg shadow-warm-orange/20 hover:shadow-xl hover:shadow-warm-orange/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">添加习惯</span>
        </button>
      </div>

      {/* Habit grid */}
      {habits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {habits.map((habit, idx) => (
            <div
              key={habit.id}
              className="mp-card p-4 flex items-center gap-3 animate-fade-in-up group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${habit.color}15` }}>
                <Icon name={habit.icon} size={22} color={habit.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-dark-brown truncate">{habit.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    style={{ backgroundColor: `${habit.color}12`, color: habit.color }}>
                    {habit.category}
                  </span>
                  <span className="text-[11px] text-gray-300">{habit.frequency}</span>
                </div>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(habit)}
                  className="p-1.5 text-gray-300 hover:text-soft-blue hover:bg-soft-blue/5 rounded-lg transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteHabit(habit.id)}
                  className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <p className="text-base font-medium mb-1">还没有习惯</p>
          <p className="text-sm">点击上方按钮添加吧</p>
        </div>
      )}

      {/* ── Form modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-dark-brown">{editing ? "编辑习惯" : "添加习惯"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-300 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">习惯名称</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="例如：阅读30分钟" maxLength={20}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown placeholder-gray-300 focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5 transition-all" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">分类</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        form.category === cat.value
                          ? "bg-dark-brown text-white shadow-lg"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">图标</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {HABIT_ICON_OPTIONS.map(({ key, icon: LucideIcon }) => (
                    <button key={key}
                      onClick={() => setForm({ ...form, icon: key })}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        form.icon === key
                          ? "bg-warm-orange text-white shadow-md shadow-warm-orange/20"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                      }`}>
                      <LucideIcon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">频率</label>
                <div className="flex gap-2">
                  {FREQUENCIES.map(f => (
                    <button key={f}
                      onClick={() => setForm({ ...form, frequency: f })}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        form.frequency === f
                          ? "bg-soft-blue text-white shadow-lg shadow-soft-blue/25"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={!form.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white font-semibold rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-warm-orange/20 hover:shadow-xl active:scale-[0.98]">
                <Save className="w-4 h-4" />
                {editing ? "保存修改" : "创建习惯"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
