export default function PixelDog({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      style={{ imageRendering: 'pixelated', ...style }}
    >
      {/* Ears */}
      <rect x="4" y="2" width="4" height="6" fill="#8B4513" />
      <rect x="24" y="2" width="4" height="6" fill="#8B4513" />
      <rect x="5" y="3" width="2" height="4" fill="#A0522D" />
      <rect x="25" y="3" width="2" height="4" fill="#A0522D" />

      {/* Head */}
      <rect x="6" y="6" width="20" height="16" fill="#D2691E" />
      <rect x="8" y="8" width="16" height="12" fill="#DEB887" />

      {/* Eyes */}
      <rect x="10" y="11" width="3" height="3" fill="#000" />
      <rect x="19" y="11" width="3" height="3" fill="#000" />
      <rect x="11" y="12" width="1" height="1" fill="#FFF" />
      <rect x="20" y="12" width="1" height="1" fill="#FFF" />

      {/* Nose */}
      <rect x="14" y="16" width="4" height="3" fill="#000" />
      <rect x="15" y="17" width="2" height="1" fill="#333" />

      {/* Mouth */}
      <rect x="13" y="19" width="6" height="1" fill="#000" />
      <rect x="14" y="20" width="2" height="1" fill="#000" />
      <rect x="18" y="20" width="2" height="1" fill="#000" />

      {/* Collar */}
      <rect x="6" y="22" width="20" height="3" fill="#DC143C" />
      <rect x="14" y="23" width="4" height="2" fill="#FFD700" />

      {/* Body */}
      <rect x="8" y="25" width="16" height="6" fill="#D2691E" />
      <rect x="10" y="26" width="12" height="4" fill="#DEB887" />

      {/* Paws */}
      <rect x="8" y="30" width="4" height="2" fill="#8B4513" />
      <rect x="20" y="30" width="4" height="2" fill="#8B4513" />
    </svg>
  );
}
