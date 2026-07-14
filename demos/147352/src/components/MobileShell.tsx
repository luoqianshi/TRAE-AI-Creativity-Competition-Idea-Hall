import type { ReactNode } from "react";

interface MobileShellProps {
  children: ReactNode;
  /** 是否需要底部 Tab 占位（主 Tab 页用 true） */
  withTabBar?: boolean;
}

/**
 * 桌面端居中手机壳容器：移动端全屏，≥768px 居中 420px。
 */
export default function MobileShell({
  children,
  withTabBar = false,
}: MobileShellProps) {
  return (
    <div
      className="mobile-shell relative mx-auto"
      style={{
        paddingBottom: withTabBar
          ? "calc(50px + env(safe-area-inset-bottom, 0px))"
          : 0,
      }}
    >
      {children}
    </div>
  );
}
