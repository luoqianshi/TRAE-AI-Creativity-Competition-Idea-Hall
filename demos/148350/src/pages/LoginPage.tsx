import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, User, ArrowRight, Heart } from "lucide-react";
import { useApp } from "../store";

function Logo() {
  return (
    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-warm-orange to-warm-orange-dark shadow-xl shadow-warm-orange/25 mb-1">
      <Sparkles className="w-10 h-10 text-white" />
      <div className="absolute -top-1 -right-1 w-6 h-6 bg-mint-green rounded-full flex items-center justify-center shadow-lg animate-pop-in">
        <Heart className="w-3.5 h-3.5 text-white fill-white" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"welcome" | "input">("welcome");
  const { login } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    login(trimmed);
    navigate("/");
  };

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-orange/[0.06] via-cream to-cream flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full animate-scale-in">
          <div className="animate-float mb-8">
            <Logo />
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-dark-brown tracking-tight mb-3">
              好习惯<span className="gradient-text">打卡</span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              AI 驱动的习惯养成伙伴<br />
              <span className="text-sm">不只记录，更是陪伴</span>
            </p>
          </div>

          {/* Feature tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["AI 陪伴鼓励", "科学习惯养成", "数据追踪回顾", "成就徽章激励"].map((tag, i) => (
              <span
                key={tag}
                className="px-4 py-2 bg-white rounded-full text-sm text-gray-500 shadow-sm border border-gray-50 animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => { setStep("input"); setTimeout(() => inputRef.current?.focus(), 150); }}
            className="group inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-warm-orange/25 hover:shadow-2xl hover:shadow-warm-orange/30 active:scale-95"
          >
            开始我的习惯之旅
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-10 text-xs text-gray-300">
            TRAE AI 创造力大赛 · 社会公益赛道
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-100/50 p-8 border border-gray-50">
          <div className="text-center mb-8">
            <div className="mb-5">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-dark-brown">欢迎加入</h2>
            <p className="text-sm text-gray-400 mt-1.5">告诉我你的名字，开启习惯之旅</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="w-5 h-5 text-gray-300" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="你的昵称"
                maxLength={12}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-dark-brown placeholder-gray-300 text-base focus:outline-none focus:border-warm-orange focus:ring-4 focus:ring-warm-orange/5 transition-all"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-warm-orange/20 hover:shadow-xl hover:shadow-warm-orange/30 active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              进入我的空间
            </button>
          </div>

          <button
            onClick={() => setStep("welcome")}
            className="w-full text-center text-sm text-gray-400 mt-5 hover:text-gray-500 transition-colors"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
