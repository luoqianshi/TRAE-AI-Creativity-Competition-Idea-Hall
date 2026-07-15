import { useState, useRef, useEffect } from "react";
import { useApp } from "../store";
import { Send, Sparkles, Heart, Smile, MessageCircle, Flame, Lightbulb, Coffee } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "给我鼓励", prompt: "我今天感觉有点累，给我一些鼓励吧", icon: Heart },
  { label: "调整习惯", prompt: "我觉得现在的好习惯有点难坚持，帮我调整一下", icon: Lightbulb },
  { label: "聊聊心情", prompt: "坚持了这么久，我想和你聊聊我的感受", icon: Coffee },
];

export default function ChatPage() {
  const { messages, sendMessage, habits, todayChecked } = useApp();
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(messages.length <= 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
    setShowWelcome(false);
  };

  const isWaiting = messages.length > 0 && messages[messages.length - 1].role === "user";
  const completedHabits = habits.filter(h => todayChecked.has(h.id));

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-soft-blue to-soft-blue-light shadow-md shadow-soft-blue/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-dark-brown">AI 伙伴</h1>
            <p className="text-xs text-gray-400">你的习惯养成陪伴者</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-mint-green animate-pulse" />
          <span className="text-xs text-gray-400">在线</span>
        </div>
      </div>

      {/* ── Messages area ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-2">
        {/* Welcome state */}
        {showWelcome && (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-soft-blue/10 mb-4 animate-float">
              <Heart className="w-8 h-8 text-soft-blue" />
            </div>
            <h3 className="text-base font-semibold text-dark-brown mb-1.5">你好呀，我是你的 AI 伙伴</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto mb-4">
              我在这里陪你养成好习惯。跟我聊聊你的感受、困惑，或者让我给你一些鼓励~
            </p>

            {/* Today summary */}
            {completedHabits.length > 0 && (
              <div className="bg-mint-green/5 border border-mint-green/20 rounded-2xl p-4 max-w-sm mx-auto mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-mint-green" />
                  <span className="text-sm font-semibold text-dark-brown">今日进度</span>
                </div>
                <p className="text-sm text-dark-brown/70">
                  你已经完成了 {completedHabits.map(h => h.name).join("、")} 的打卡
                </p>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => { sendMessage(action.prompt); setShowWelcome(false); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm text-gray-500 shadow-sm hover:border-soft-blue hover:text-soft-blue transition-all hover:shadow-md"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat bubbles */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-soft-blue/15 flex items-center justify-center flex-shrink-0 mr-2 mt-1.5">
                <Sparkles className="w-4 h-4 text-soft-blue" />
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-2.5 rounded-[18px] text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-warm-orange text-white rounded-br-md shadow-md shadow-warm-orange/10"
                  : "bg-white text-dark-brown rounded-bl-md shadow-sm border border-gray-50"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-warm-orange/15 flex items-center justify-center flex-shrink-0 ml-2 mt-1.5">
                <Smile className="w-4 h-4 text-warm-orange" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isWaiting && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-soft-blue/15 flex items-center justify-center flex-shrink-0 mr-2">
              <Sparkles className="w-4 h-4 text-soft-blue" />
            </div>
            <div className="bg-white border border-gray-50 rounded-[18px] rounded-bl-md shadow-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="glass rounded-2xl shadow-sm border border-white/40 p-2.5 flex items-end gap-2 mt-2">
        <MessageCircle className="w-5 h-5 text-gray-300 flex-shrink-0 mb-1.5" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="说说你的想法..."
          className="flex-1 bg-transparent text-sm text-dark-brown placeholder-gray-300 focus:outline-none py-1.5"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-2.5 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-warm-orange/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
