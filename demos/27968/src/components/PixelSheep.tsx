export default function PixelSheep({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Wool body */}
      <rect x="4" y="8" width="24" height="20" fill="#F5F5F5" />
      <rect x="2" y="10" width="4" height="16" fill="#FFF" />
      <rect x="26" y="10" width="4" height="16" fill="#FFF" />
      <rect x="6" y="6" width="20" height="4" fill="#FFF" />
      <rect x="6" y="26" width="20" height="4" fill="#FFF" />

      {/* Wool puffs */}
      <rect x="8" y="10" width="4" height="4" fill="#FFF" />
      <rect x="14" y="10" width="4" height="4" fill="#FFF" />
      <rect x="20" y="10" width="4" height="4" fill="#FFF" />
      <rect x="8" y="16" width="4" height="4" fill="#FFF" />
      <rect x="14" y="16" width="4" height="4" fill="#FFF" />
      <rect x="20" y="16" width="4" height="4" fill="#FFF" />
      <rect x="8" y="22" width="4" height="4" fill="#FFF" />
      <rect x="14" y="22" width="4" height="4" fill="#FFF" />
      <rect x="20" y="22" width="4" height="4" fill="#FFF" />

      {/* Face */}
      <rect x="24" y="12" width="8" height="10" fill="#000" />
      <rect x="26" y="14" width="2" height="2" fill="#FFF" />
      <rect x="30" y="14" width="2" height="2" fill="#FFF" />
      <rect x="27" y="18" width="2" height="1" fill="#FFF" />

      {/* Legs */}
      <rect x="6" y="28" width="3" height="4" fill="#000" />
      <rect x="13" y="28" width="3" height="4" fill="#000" />
      <rect x="20" y="28" width="3" height="4" fill="#000" />
      <rect x="23" y="28" width="3" height="4" fill="#000" />
    </svg>
  );
}
