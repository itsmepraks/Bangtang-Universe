import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { lyricsAnalyzer, extractThemes } from '../../../../services/lyricsAnalysisService';
import { CHART_STYLES } from '../../../../constants/colors';
import type { Lyrics, Song, Album } from '../../../../types/database';

interface LyricsPanelProps {
  lyrics: Lyrics[];
  songs: Song[];
  albums: Album[];
}

const PURPLE_SHADES = [
  'text-purple-400',
  'text-purple-300',
  'text-indigo-400',
  'text-white/60',
] as const;

export default function LyricsPanel({ lyrics, songs, albums }: LyricsPanelProps) {
  const [hoveredCell, setHoveredCell] = useState<{ theme: string; era: string; count: number } | null>(null);

  // Compute theme × era heatmap data
  const themeHeatmap = useMemo(() => {
    const songAlbumMap = new Map<number, number>();
    for (const song of songs) {
      if (song.album_id != null) songAlbumMap.set(song.id, song.album_id);
    }
    const albumLookup = new Map<number, Album>();
    for (const album of albums) albumLookup.set(album.id, album);

    // Get eras in chronological order
    const eraOrder = [...new Set(
      albums
        .filter(a => a.era)
        .sort((a, b) => a.release_date.localeCompare(b.release_date))
        .map(a => a.era!)
    )];

    // Count themes per era
    const grid = new Map<string, Map<string, number>>();
    const themeTotals = new Map<string, number>();

    for (const entry of lyrics) {
      if (!entry.lyrics_english) continue;
      const albumId = songAlbumMap.get(entry.song_id);
      if (albumId == null) continue;
      const album = albumLookup.get(albumId);
      if (!album || !album.era) continue;

      const themes = entry.themes && entry.themes.length > 0
        ? entry.themes
        : extractThemes(entry.lyrics_english);

      for (const theme of themes) {
        const display = theme.charAt(0).toUpperCase() + theme.slice(1);
        if (!grid.has(display)) grid.set(display, new Map());
        const eraMap = grid.get(display)!;
        eraMap.set(album.era, (eraMap.get(album.era) ?? 0) + 1);
        themeTotals.set(display, (themeTotals.get(display) ?? 0) + 1);
      }
    }

    // Sort themes by total frequency, take top 14
    const sortedThemes = Array.from(themeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([theme]) => theme);

    // Find max count for opacity scaling
    let maxCount = 0;
    for (const [, eraMap] of grid) {
      for (const [, count] of eraMap) {
        if (count > maxCount) maxCount = count;
      }
    }

    return { themes: sortedThemes, eras: eraOrder, grid, maxCount };
  }, [lyrics, songs, albums]);

  // Compute word frequency (top 40)
  const wordData = useMemo(() => {
    return lyricsAnalyzer.getWordFrequency(lyrics, 40);
  }, [lyrics]);

  // Compute sentiment arc averaged per album
  const sentimentArc = useMemo(() => {
    const points = lyricsAnalyzer.analyzeSentimentArc(lyrics, songs, albums);

    const albumMap = new Map<string, { total: number; count: number }>();
    const albumOrder: string[] = [];

    for (const point of points) {
      const existing = albumMap.get(point.albumTitle);
      if (existing) {
        existing.total += point.sentimentScore;
        existing.count += 1;
      } else {
        albumMap.set(point.albumTitle, {
          total: point.sentimentScore,
          count: 1,
        });
        albumOrder.push(point.albumTitle);
      }
    }

    return albumOrder.map((title) => {
      const entry = albumMap.get(title)!;
      return {
        album: title,
        sentiment: parseFloat((entry.total / entry.count).toFixed(3)),
      };
    });
  }, [lyrics, songs, albums]);

  // Compute font sizes for the word cloud
  const wordCloudItems = useMemo(() => {
    if (wordData.length === 0) return [];
    const maxCount = wordData[0].count;
    const minCount = wordData[wordData.length - 1].count;
    const range = maxCount - minCount || 1;

    return wordData.map((w, i) => ({
      word: w.word,
      count: w.count,
      fontSize: 12 + ((w.count - minCount) / range) * 20,
      colorClass: PURPLE_SHADES[i % PURPLE_SHADES.length],
    }));
  }, [wordData]);

  // ------ Empty State ------
  if (lyrics.length === 0) {
    return (
      <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-8 text-center">
        <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-white/70 mb-2">Lyrics Analysis</h3>
        <p className="text-xs text-white/40 max-w-sm mx-auto">
          No lyrics data available. Connect to the database to enable lyrics analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Theme × Era Heatmap */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-1">Theme Evolution Across Eras</h3>
        <p className="text-[10px] text-white/30 mb-4">How BTS's lyrical themes shifted over time — darker cells = more songs with that theme</p>
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-4 md:p-6">
          {themeHeatmap.themes.length > 0 ? (
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#111118] to-transparent pointer-events-none z-10" />
              <div className="overflow-x-auto scrollbar-hide">
              <div
                className="grid gap-px min-w-[600px]"
                style={{
                  gridTemplateColumns: `120px repeat(${themeHeatmap.eras.length}, 1fr)`,
                }}
              >
                {/* Header row: empty corner + era names */}
                <div />
                {themeHeatmap.eras.map((era) => (
                  <div
                    key={era}
                    className="text-[9px] text-white/40 text-center pb-2 font-medium leading-tight"
                  >
                    {era}
                  </div>
                ))}

                {/* Data rows */}
                {themeHeatmap.themes.map((theme) => (
                  <>
                    <div
                      key={`label-${theme}`}
                      className="text-[11px] text-white/60 font-medium flex items-center pr-3 h-7"
                    >
                      {theme}
                    </div>
                    {themeHeatmap.eras.map((era) => {
                      const count = themeHeatmap.grid.get(theme)?.get(era) ?? 0;
                      const intensity = themeHeatmap.maxCount > 0 ? count / themeHeatmap.maxCount : 0;
                      const isHovered = hoveredCell?.theme === theme && hoveredCell?.era === era;

                      return (
                        <div
                          key={`${theme}-${era}`}
                          className="relative h-7 rounded-sm cursor-default transition-all duration-150"
                          style={{
                            backgroundColor: count > 0
                              ? `rgba(168, 85, 247, ${0.08 + intensity * 0.72})`
                              : 'rgba(255, 255, 255, 0.02)',
                            boxShadow: isHovered ? '0 0 0 1px rgba(168, 85, 247, 0.5)' : 'none',
                          }}
                          onMouseEnter={() => setHoveredCell({ theme, era, count })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {count > 0 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white/70 font-medium">
                              {count}
                            </span>
                          )}

                          {/* Tooltip */}
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
                              <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
                                <p className="text-[10px] text-white/90 font-medium">{theme} — {era}</p>
                                <p className="text-[9px] text-white/50">
                                  {count > 0 ? `${count} song${count !== 1 ? 's' : ''}` : 'No matches'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
            </div>
          ) : (
            <p className="text-xs text-white/40 text-center py-8">
              No theme data found in lyrics.
            </p>
          )}
        </div>
      </div>

      {/* 2. Word Frequency (Word Cloud) */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Most Used Words</h3>
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
          {wordCloudItems.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center items-baseline">
              {wordCloudItems.map((item) => (
                <span
                  key={item.word}
                  className={`${item.colorClass} font-medium leading-none cursor-default transition-opacity hover:opacity-80`}
                  style={{ fontSize: `${item.fontSize}px` }}
                  title={`${item.word}: ${item.count} occurrences`}
                >
                  {item.word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40 text-center py-8">
              No word frequency data available.
            </p>
          )}
        </div>
      </div>

      {/* 3. Sentiment Area Chart */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-1">Sentiment Score Across Albums</h3>
        <p className="text-[10px] text-white/30 mb-4">Average emotional tone per album — positive (above line) vs negative (below line)</p>
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
          {sentimentArc.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={sentimentArc}
                margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
              >
                <defs>
                  <linearGradient id="sentimentFillPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.5} />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.GRID.strokeDasharray}
                  stroke={CHART_STYLES.GRID.stroke}
                />
                <XAxis
                  dataKey="album"
                  axisLine={false}
                  tickLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                  formatter={(value) => {
                    const v = Number(value);
                    const label = v > 0 ? 'Positive' : v < 0 ? 'Negative' : 'Neutral';
                    return [
                      `${v > 0 ? '+' : ''}${v.toFixed(3)} (${label})`,
                      'Avg Sentiment',
                    ];
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Neutral',
                    position: 'right',
                    fill: 'rgba(255,255,255,0.3)',
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#A855F7"
                  strokeWidth={2}
                  fill="url(#sentimentFillPos)"
                  dot={{ fill: '#A855F7', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#C084FC', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-white/40 text-center py-8">
              No sentiment data available for albums.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
