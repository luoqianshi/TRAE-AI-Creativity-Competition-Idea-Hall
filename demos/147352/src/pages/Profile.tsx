import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import PasswordModal from "@/components/PasswordModal";
import { useAppStore } from "@/store/useAppStore";

export default function Profile() {
  const navigate = useNavigate();
  const appPassword = useAppStore((s) => s.appPassword);
  const [pwdOpen, setPwdOpen] = useState(false);

  const menuItems = [
    { emoji: "🔔", label: "提醒设置", desc: "往来提醒 · 人情无忧", action: () => navigate("/reminders") },
    { emoji: "📤", label: "数据导出", desc: "导出账单 · 备份恢复", action: () => {} },
    {
      emoji: "🔒",
      label: appPassword ? "修改密码" : "设置密码",
      desc: appPassword ? "应用锁已开启 · 点击修改" : "应用锁 · 隐私保护",
      action: () => setPwdOpen(true),
    },
  ];

  return (
    <MobileShell withTabBar>
      <NavBar title="我的" />

      <main className="px-4 pt-4">
        {/* 用户卡 */}
        <section
          className="rounded-md p-5"
          style={{
            background: "linear-gradient(135deg, var(--brand) 0%, #9B59B6 100%)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-[24px] font-bold text-white"
              style={{ backdropFilter: "blur(4px)" }}
            >
              我
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-h2 font-bold text-white">人情账本用户</div>
              <div className="mt-1 truncate text-caption text-white/70">
                本地账本 · 私密守护
              </div>
            </div>
          </div>
        </section>

        {/* 设置列表 */}
        <section
          className="mt-4 overflow-hidden rounded-md"
          style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-1)" }}
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center px-4 text-left active:bg-fill"
              style={{ height: 56, borderBottom: idx < menuItems.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <span className="mr-3 shrink-0 text-[20px]">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-body text-text1">{item.label}</div>
                {item.desc && (
                  <div className="mt-px truncate text-[12px] text-text3">{item.desc}</div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-text4" />
            </button>
          ))}

          {/* 意见反馈 */}
          <div
            className="flex items-center px-4"
            style={{ height: 56, borderTop: "1px solid var(--border)" }}
          >
            <span className="mr-3 shrink-0 text-[20px]">💬</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-body text-text1">意见反馈</div>
              <div className="mt-px truncate text-[12px] text-text3">
                问题反馈 · 功能建议
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-text4" />
          </div>

          {/* 关于软件 */}
          <div
            className="flex items-center px-4"
            style={{ height: 56, borderTop: "1px solid var(--border)" }}
          >
            <span className="mr-3 shrink-0 text-[20px]">ℹ️</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-body text-text1">关于软件</div>
              <div className="mt-px truncate text-[12px] text-text3">
                功能介绍 · 联系我们
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-text4" />
          </div>

          {/* 隐私政策 */}
          <div
            className="flex items-center px-4"
            style={{ height: 56, borderTop: "1px solid var(--border)" }}
          >
            <span className="mr-3 shrink-0 text-[20px]">🛡️</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-body text-text1">隐私政策</div>
              <div className="mt-px truncate text-[12px] text-text3">
                数据采集 · 权限使用
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-text4" />
          </div>
        </section>
      </main>

      <TabBar />

      <PasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} />
    </MobileShell>
  );
}
