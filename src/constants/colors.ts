export const BORAHAE_COLORS = {
  PRIMARY: '#A855F7',
  LIGHT: '#D8B4FE',
  INDIGO: '#818CF8',
  VIOLET: '#C084FC',
  DARK: '#7E22CE',
} as const;

export const MEMBER_COLORS = {
  RM: '#2563EB',
  JIN: '#EC4899',
  SUGA: '#10B981',
  J_HOPE: '#EF4444',
  JIMIN: '#F59E0B',
  V: '#22c55e',
  JUNGKOOK: '#8B5CF6',
} as const;

export const UNIVERSE_COLORS = {
  SPACE: '#020005',
  NEBULA: 'rgba(88, 28, 135, 0.4)',
  STARS: ['#ffffff', '#A855F7', '#D8B4FE', '#818CF8', '#C084FC'],
} as const;

export const UI_COLORS = {
  GLASS_BG: 'rgba(255, 255, 255, 0.03)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.08)',
  TEXT_PRIMARY: 'rgba(255, 255, 255, 0.95)',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.70)',
  TEXT_MUTED: 'rgba(255, 255, 255, 0.50)',
} as const;

export const CHART_STYLES = {
  AXIS: { fontSize: 12, fill: 'rgba(255,255,255,0.5)' },
  GRID: { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.06)' },
  TOOLTIP: {
    contentStyle: {
      background: 'rgba(10, 8, 20, 0.97)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.85)',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      letterSpacing: '-0.01em',
    },
    labelStyle: { color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: '13px' },
    cursor: { fill: 'rgba(255,255,255,0.02)' },
  },
  // Subtle hover for Bar charts — prevents the bright default Recharts highlight
  BAR_ACTIVE: { fillOpacity: 0.95 },
} as const;

export const SENTIMENT_COLORS = {
  JOY: '#FBBF24',
  GRATITUDE: '#A78BFA',
  DETERMINATION: '#F59E0B',
  FEAR: '#EF4444',
  LONGING: '#3B82F6',
  PAIN: '#DC2626',
  COMFORT: '#10B981',
  DESTINY: '#8B5CF6',
  CELEBRATION: '#EC4899',
  CONFIDENCE: '#F59E0B',
} as const;

export const SECTION_ACCENTS = {
  overview: '#A855F7',
  discography: '#818CF8',
  members: '#EC4899',
  analytics: '#06B6D4',
  awards: '#FBBF24',
  tours: '#10B981',
  media: '#F97316',
  search: '#A855F7',
} as const;

export const getMemberColor = (memberId: string): string => {
  const colorMap: Record<string, string> = {
    'rm': MEMBER_COLORS.RM,
    'jin': MEMBER_COLORS.JIN,
    'suga': MEMBER_COLORS.SUGA,
    'jh': MEMBER_COLORS.J_HOPE,
    'jm': MEMBER_COLORS.JIMIN,
    'v': MEMBER_COLORS.V,
    'jk': MEMBER_COLORS.JUNGKOOK,
  };

  return colorMap[memberId.toLowerCase()] || BORAHAE_COLORS.PRIMARY;
};

export const getSentimentColor = (sentiment: string): string => {
  const sentimentKey = sentiment.toUpperCase().replace(/\s+/g, '_');
  return SENTIMENT_COLORS[sentimentKey as keyof typeof SENTIMENT_COLORS] || BORAHAE_COLORS.PRIMARY;
};

export const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const COLORS = {
  BORAHAE: BORAHAE_COLORS,
  MEMBERS: MEMBER_COLORS,
  UNIVERSE: UNIVERSE_COLORS,
  UI: UI_COLORS,
  SENTIMENT: SENTIMENT_COLORS,
  SECTION_ACCENTS,
} as const;

export default COLORS;
