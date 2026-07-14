import type { ReactNode } from "react";
import { ChevronLeft, MoreHorizontal, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  backTo?: string;
  /** 自定义右侧内容，不传则显示默认胶囊菜单 */
  right?: ReactNode;
}

/**
 * 微信小程序风格导航栏：左返回 / 中标题 / 右胶囊菜单。
 */
export default function NavBar({
  title,
  showBack = false,
  onBack,
  backTo,
  right,
}: NavBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backTo) return navigate(backTo);
    navigate(-1);
  };

  return (
    <>
      {/* 状态栏占位 */}
      <div className="h-11" />
      <header
        className="sticky top-0 z-30 border-b border-borderbase"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex h-11 items-center px-4">
          {/* 左：返回 */}
          <div className="flex w-[88px] items-center justify-start">
            {showBack && (
              <button
                onClick={handleBack}
                className="inline-flex h-8 w-8 items-center justify-center active:opacity-60"
                aria-label="返回"
              >
                <ChevronLeft className="h-5 w-5 text-text1" />
              </button>
            )}
          </div>
          {/* 中：标题 */}
          <div className="min-w-0 flex-1 text-center text-[16px] font-semibold tracking-[-0.02em] text-text1 truncate">
            {title}
          </div>
          {/* 右：自定义或胶囊 */}
          <div className="flex w-[88px] items-center justify-end">
            {right ?? (
              <div
                className="flex h-8 w-[88px] items-center justify-center rounded-full border border-borderbase bg-white/90"
                aria-label="小程序菜单"
              >
                <button
                  className="flex h-full flex-1 items-center justify-center active:opacity-60"
                  aria-label="更多"
                >
                  <MoreHorizontal className="h-4 w-4 text-text2" />
                </button>
                <span className="h-4 w-px bg-borderbase" aria-hidden="true" />
                <button
                  className="flex h-full flex-1 items-center justify-center active:opacity-60"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4 text-text2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
