// Unified 3-tier rating visual system across all themes.
// Visual hierarchy MUST be clearly stepped — three distinct color treatments,
// not just "with/without emoji":
//   Level 1: very light pastel tint of the theme color (low intensity)
//   Level 2: medium-saturation flat color (mid intensity, recognizable theme)
//   Level 3: bright metallic gradient with glow (the "medal" — peak intensity)

export type RatingLevel = 1 | 2 | 3;

export interface RatingVisuals {
  background: string;
  boxShadow: string;
  border?: string;
  numberColor: string;
  numberShadow: string;
}

const isDark = () => document.documentElement.classList.contains('dark');

/**
 * Per-theme color palette across the 3 levels.
 * Each theme defines:
 *   level1: pale pastel (15-25% saturation feel)
 *   level2: medium flat color (recognizable theme color, mid brightness)
 *   level3: full metallic gradient (peak brightness, premium feel)
 *
 * To add a new theme, just add an entry here.
 */
interface ThemeRatingPalette {
  level1Light: string;
  level1Dark: string;
  level2: string;          // solid mid-tone
  level2Dark?: string;
  level3Gradient: string;  // metallic
  level3Glow: string;      // glow shadow
}

const PALETTES: Record<string, ThemeRatingPalette> = {
  red: {
    level1Light: '#FEE2E2',
    level1Dark:  'rgba(248, 113, 113, 0.22)',
    level2:      '#F87171',
    level2Dark:  '#DC2626',
    level3Gradient: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 35%, #B91C1C 75%, #7F1D1D 100%)',
    level3Glow:  '0 0 24px rgba(220, 38, 38, 0.6), 0 6px 18px rgba(185, 28, 28, 0.4)',
  },
  orange: {
    level1Light: '#FFEDD5',
    level1Dark:  'rgba(251, 146, 60, 0.22)',
    level2:      '#FB923C',
    level2Dark:  '#EA580C',
    // 流沙金 — sandy gold metallic
    level3Gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 18%, #FBBF24 38%, #F97316 65%, #B45309 100%)',
    level3Glow:  '0 0 24px rgba(249, 115, 22, 0.65), 0 6px 18px rgba(194, 65, 12, 0.4)',
  },
  yellow: {
    level1Light: '#FEF9C3',
    level1Dark:  'rgba(250, 204, 21, 0.22)',
    level2:      '#FACC15',
    level2Dark:  '#EAB308',
    level3Gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 25%, #FACC15 55%, #CA8A04 85%, #78350F 100%)',
    level3Glow:  '0 0 24px rgba(250, 204, 21, 0.7), 0 6px 18px rgba(202, 138, 4, 0.4)',
  },
  green: {
    level1Light: '#DCFCE7',
    level1Dark:  'rgba(74, 222, 128, 0.22)',
    level2:      '#4ADE80',
    level2Dark:  '#16A34A',
    level3Gradient: 'linear-gradient(135deg, #D1FAE5 0%, #6EE7B7 25%, #10B981 55%, #047857 100%)',
    level3Glow:  '0 0 24px rgba(16, 185, 129, 0.6), 0 6px 18px rgba(5, 150, 105, 0.4)',
  },
  cyan: {
    level1Light: '#CFFAFE',
    level1Dark:  'rgba(34, 211, 238, 0.22)',
    level2:      '#22D3EE',
    level2Dark:  '#0891B2',
    level3Gradient: 'linear-gradient(135deg, #CFFAFE 0%, #67E8F9 25%, #06B6D4 55%, #0E7490 100%)',
    level3Glow:  '0 0 24px rgba(6, 182, 212, 0.6), 0 6px 18px rgba(14, 116, 144, 0.4)',
  },
  blue: {
    level1Light: '#DBEAFE',
    level1Dark:  'rgba(96, 165, 250, 0.22)',
    level2:      '#60A5FA',
    level2Dark:  '#2563EB',
    level3Gradient: 'linear-gradient(135deg, #DBEAFE 0%, #93C5FD 25%, #3B82F6 55%, #1D4ED8 100%)',
    level3Glow:  '0 0 24px rgba(59, 130, 246, 0.6), 0 6px 18px rgba(29, 78, 216, 0.4)',
  },
  purple: {
    level1Light: '#F3E8FF',
    level1Dark:  'rgba(167, 139, 250, 0.22)',
    level2:      '#A78BFA',
    level2Dark:  '#9333EA',
    level3Gradient: 'linear-gradient(135deg, #F3E8FF 0%, #C4B5FD 25%, #8B5CF6 55%, #6D28D9 100%)',
    level3Glow:  '0 0 24px rgba(139, 92, 246, 0.6), 0 6px 18px rgba(109, 40, 217, 0.4)',
  },
  pink: {
    level1Light: '#FCE7F3',
    level1Dark:  'rgba(244, 114, 182, 0.22)',
    level2:      '#F472B6',
    level2Dark:  '#DB2777',
    level3Gradient: 'linear-gradient(135deg, #FCE7F3 0%, #F9A8D4 25%, #EC4899 55%, #BE185D 100%)',
    level3Glow:  '0 0 24px rgba(236, 72, 153, 0.6), 0 6px 18px rgba(190, 24, 93, 0.4)',
  },
  // BLACK / Cyber theme — no rose pink anywhere
  black: {
    level1Light: 'rgba(20, 83, 45, 0.55)',
    level1Dark:  'rgba(20, 83, 45, 0.55)',
    level2:      '#15803D',
    level2Dark:  '#15803D',
    // 冷冽电光绿 — cold electric green
    level3Gradient: 'linear-gradient(135deg, #BBF7D0 0%, #4ADE80 30%, #22C55E 60%, #15803D 100%)',
    level3Glow:  '0 0 28px rgba(74, 222, 128, 0.85), 0 0 14px rgba(74, 222, 128, 0.6), 0 6px 18px rgba(34, 197, 94, 0.45)',
  },
  // WHITE / Holographic theme
  white: {
    level1Light: '#EEF2FF',
    level1Dark:  'rgba(129, 140, 248, 0.22)',
    level2:      '#818CF8',
    level2Dark:  '#6366F1',
    level3Gradient: 'linear-gradient(135deg, #FCA5A5 0%, #FBBF24 20%, #4ADE80 40%, #60A5FA 60%, #C084FC 80%, #F472B6 100%)',
    level3Glow:  '0 0 24px rgba(192, 132, 252, 0.55), 0 6px 18px rgba(99, 102, 241, 0.35)',
  },
};

const DARK_THEMES = new Set(['black']);

/** Returns visuals for a single rating cell — used by both calendars. */
export const getRatingVisuals = (themeId: string, level: RatingLevel): RatingVisuals => {
  const id = themeId || 'orange';
  const palette = PALETTES[id] || PALETTES.orange;
  const themeIsDark = DARK_THEMES.has(id) || isDark();

  const deepNumber  = '#3F2A1A'; // deep warm brown for vibrant themes
  const whiteNumber = '#FFFFFF';

  if (level === 1) {
    return {
      background: themeIsDark ? palette.level1Dark : palette.level1Light,
      boxShadow: themeIsDark
        ? '0 2px 8px rgba(0,0,0,0.3)'
        : '0 1px 3px rgba(0,0,0,0.06)',
      // On the very pale Level 1, deep number reads cleanly
      numberColor: themeIsDark ? whiteNumber : deepNumber,
      numberShadow: themeIsDark
        ? '0 1px 3px rgba(0,0,0,0.7)'
        : 'none',
    };
  }

  if (level === 2) {
    const bg = themeIsDark ? (palette.level2Dark || palette.level2) : palette.level2;
    return {
      background: bg,
      boxShadow: themeIsDark
        ? '0 4px 14px rgba(0,0,0,0.45)'
        : '0 4px 12px rgba(0,0,0,0.18)',
      // Mid-tone background — white reads best across themes EXCEPT yellow
      // (where deep brown stays for contrast).
      numberColor: id === 'yellow' && !themeIsDark ? deepNumber : whiteNumber,
      numberShadow: id === 'yellow' && !themeIsDark
        ? '0 1px 1px rgba(255,255,255,0.4)'
        : '0 1px 3px rgba(0,0,0,0.45)',
    };
  }

  // Level 3 — the medal
  return {
    background: palette.level3Gradient,
    boxShadow: palette.level3Glow + ', inset 0 1px 0 rgba(255,255,255,0.55)',
    border: themeIsDark
      ? '1.5px solid rgba(255,255,255,0.4)'
      : '1.5px solid rgba(255,255,255,0.75)',
    // Deep number on bright metallic for readability (white themes too).
    // Black/cyber theme uses pure white + heavy shadow against electric green.
    numberColor: themeIsDark ? whiteNumber : deepNumber,
    numberShadow: themeIsDark
      ? '0 1px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)'
      : '0 1px 2px rgba(255,255,255,0.6), 0 0 4px rgba(255,255,255,0.4)',
  };
};

export const getEmptyCellVisuals = (themeId: string) => {
  const id = themeId || 'orange';
  const themeIsDark = DARK_THEMES.has(id) || isDark();
  return {
    background: themeIsDark ? 'rgba(255,255,255,0.04)' : 'hsl(var(--card) / 0.7)',
    numberColor: themeIsDark ? 'rgba(255,255,255,0.85)' : 'hsl(var(--foreground) / 0.7)',
    numberShadow: themeIsDark ? '0 1px 2px rgba(0,0,0,0.6)' : 'none',
  };
};

/** Exposed so other UI (record page, posters) can match the medal styling. */
export const getLevelPalette = (themeId: string) => {
  const id = themeId || 'orange';
  return PALETTES[id] || PALETTES.orange;
};
