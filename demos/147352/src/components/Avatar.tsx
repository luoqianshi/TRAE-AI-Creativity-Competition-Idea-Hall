interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  /** 是否使用姓氏首字 */
  surname?: boolean;
}

/**
 * 姓氏头像：圆形彩色背景 + 首字。
 */
export default function Avatar({
  name,
  color = "var(--brand)",
  size = 40,
  surname = true,
}: AvatarProps) {
  const char = surname ? name.charAt(0) : name;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.375,
      }}
    >
      {char}
    </div>
  );
}
