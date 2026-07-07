import type { MedicineStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusSealProps {
  status: MedicineStatus;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const config: Record<
  MedicineStatus,
  { label: string; ring: string; text: string; bg: string }
> = {
  expired: {
    label: "已过",
    ring: "border-seal",
    text: "text-seal",
    bg: "bg-seal/8",
  },
  expiring: {
    label: "将过",
    ring: "border-amber",
    text: "text-amber",
    bg: "bg-amber/10",
  },
  safe: {
    label: "可用",
    ring: "border-moss",
    text: "text-moss",
    bg: "bg-moss/10",
  },
};

const sizeMap = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-base",
  lg: "h-20 w-20 text-lg",
};

export default function StatusSeal({
  status,
  size = "md",
  animate = true,
  className,
}: StatusSealProps) {
  const c = config[status];
  return (
    <span
      className={cn(
        "seal-base font-serif font-bold tracking-wider",
        sizeMap[size],
        c.ring,
        c.text,
        c.bg,
        animate && "animate-seal-stamp",
        "transition-transform duration-300 hover:rotate-0",
        className,
      )}
      title={c.label}
    >
      <span className="flex flex-col items-center leading-none">
        <span className="text-[0.6em] opacity-70">状态</span>
        <span className="mt-0.5">{c.label}</span>
      </span>
    </span>
  );
}
