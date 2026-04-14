import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import type { Song, Album, Lyrics } from '../../../../types/database';
import {
  computeSentimentDistribution,
  buildEraOrder,
} from '../../../../services/analyticsService';
import { lyricsAnalyzer, extractThemes } from '../../../../services/lyricsAnalysisService';
import { getSentimentColor, CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';
import ChartSection from '../../../ui/ChartSection';

const POSITIVE_SENTIMENTS = new Set([
  'Joy', 'Gratitude', 'Comfort', 'Celebration', 'Confidence', 'Determination',
]);

const PURPLE_SHADES = [
  'text-purple-400',
  'text-purple-300',
  'text-indigo-400',
  'text-white/60',
] as const;

interface MoodPanelProps {
  songs: Song[];
  albums: Album[];
  lyrics: Lyrics[];
}

export default function MoodPanel({ songs, albums, lyrics }: MoodPanelProps) {
  const [hoveredCell, setHoveredCell] = useState<{ theme: string; era: string; count: number } | null>(null);

  // ── Coverage stats ──
  const withSentiment = useMemo(() => songs.filter(s => s.sentiment).length, [songs]);
  const coveragePct = songs.length > 0 ? Math.round((withSentiment / songs.length) * 100) : 0;

  // ── Section 2: Sentiment Distribution ──
  const distribution = useMemo(() => computeSentimentDistribution(songs), [songs]);

  const summaryStats = useMemo(() => {
    const total = distribution.reduce((s, d) => s + d.count, 0);
    const positiveCount = distribution
      .filter(d => POSITIVE_SENTIMENTS.has(d.sentiment))
      .reduce((s, d) => s + d.count, 0);
    const reflectiveCount = total - positiveCount;
    return {
      total,
      positiveCount,
      reflectiveCount,
      positivePct: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
    };
  }, [distribution]);

  const sentimentExamples = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const song of songs) {
      if (!song.sentiment) continue;
      if (!map.has(song.sentiment)) map.set(song.sentiment, []);
      const arr = map.get(song.sentiment)!;
      if (song.is_title_track && arr.length < 3) {
        arr.unshift(song.title);
        if (arr.length > 3) arr.pop();
      } else if (arr.length < 3) {
        arr.push(song.title);
      }
    }
    return map;
  }, [songs]);

  const distributionChartHeight = Math.min(360, Math.max(220, distribution.length * 36));

  // ── Section 3: Theme × Era Heatmap ──
  const eraOrder = useMemo(() => buildEraOrder(albums), [albums]);

  const themeHeatmap = useMemo(() => {
    const songAlbumMap = new Map<number, number>();
    for (const song of songs) {
      if (song.album_id != null) songAlbumMap.set(song.id, song.album_id);
    }
    const albumLookup = new Map<number, Album>();
    for (const album of albums) albumLookup.set(album.id, album);

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

    const sortedThemes = Array.from(themeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([theme]) => theme);

    let maxCount = 0;
    for (const [, eraMap] of grid) {
      for (const [, count] of eraMap) {
        if (count > maxCount) maxCount = count;
      }
    }

    return { themes: sortedThemes, eras: eraOrder, grid, maxCount };
  }, [lyrics, songs, albums, eraOrder]);

  // ── Section 4: Sentiment Arc ──
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
        albumMap.set(point.albumTitle, { total: point.sentimentScore, count: 1 });
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

  // ── Section 5: Word Cloud ──
  const wordCloudItems = useMemo(() => {
    const wordData = lyricsAnalyzer.getWordFrequency(lyrics, 40);
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
  }, [lyrics]);

  return (
    <div className="space-y-8">
      {/* ===== 1. Coverage Banner ===== */}
      <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl px-4 py-3">
        <p className="text-sm text-pink-300/70">
          Sentiment data for{' '}
          <span className="font-semibold text-pink-300">{withSentiment}</span> of{' '}
          <span className="font-semibold text-pink-300">{songs.length}</span> songs ({coveragePct}%)
        </p>
      </div>

      {/* ===== 2. Sentiment Distribution ===== */}
      <ChartSection title="Sentiment Distribution" variant="gradient">
        {/* Positive vs Reflective split bar */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/70" />
              <span className="text-[10px] text-white/40 uppercase tracking-wide">
                Positive {summaryStats.positivePct}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/70" />
              <span className="text-[10px] text-white/40 uppercase tracking-wide">
                Reflective {100 - summaryStats.positivePct}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-400/50 transition-all duration-500"
              style={{ width: `${summaryStats.positivePct}%` }}
            />
            <div
              className="h-full bg-blue-400/40 transition-all duration-500"
              style={{ width: `${100 - summaryStats.positivePct}%` }}
            />
          </div>
        </div>

        {/* Horizontal bar chart */}
        <ResponsiveContainer width="100%" height={distributionChartHeight}>
          <BarChart
            data={distribution}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid {...CHART_STYLES.GRID} horizontal={false} />
            <XAxis type="number" tick={CHART_STYLES.AXIS} />
            <YAxis
              type="category"
              dataKey="sentiment"
              tick={CHART_STYLES.AXIS}
              width={110}
            />
            <Tooltip
              cursor={CHART_STYLES.TOOLTIP.cursor}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]?.payload as
                  | { sentiment: string; count: number; percentage: number }
                  | undefined;
                if (!data) return null;
                const color = getSentimentColor(data.sentiment);
                const examples = sentimentExamples.get(data.sentiment) || [];
                return (
                  <div style={CHART_STYLES.TOOLTIP.contentStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          backgroundColor: color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ ...CHART_STYLES.TOOLTIP.labelStyle }}>{data.sentiment}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: examples.length > 0 ? 8 : 0 }}>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600 }}>
                          {data.count}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 4 }}>
                          songs
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600 }}>
                          {data.percentage}%
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginLeft: 4 }}>
                          of catalog
                        </span>
                      </div>
                    </div>
                    {examples.length > 0 && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
                        <span
                          style={{
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Example songs
                        </span>
                        {examples.map((title) => (
                          <div
                            key={title}
                            style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}
                          >
                            {title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20} activeBar={CHART_STYLES.BAR_ACTIVE}>
              {distribution.map((entry) => (
                <Cell key={entry.sentiment} fill={getSentimentColor(entry.sentiment)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>

      {/* ===== 3. Theme x Era Heatmap ===== */}
      <div className="bg-[#0c0c14] rounded-2xl p-4 md:p-6">
        <h3 className="text-base font-bold text-white/85 mb-1">Theme Evolution Across Eras</h3>
        <p className="text-[10px] text-white/30 mb-4">
          How BTS&apos;s lyrical themes shifted over time — darker cells = more songs with that theme
        </p>

        {themeHeatmap.themes.length > 0 ? (
          <div className="relative">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0c0c14] to-transparent pointer-events-none z-10" />
            <div className="overflow-x-auto scrollbar-hide">
              <div
                className="grid gap-px min-w-[600px]"
                style={{
                  gridTemplateColumns: `120px repeat(${themeHeatmap.eras.length}, 1fr)`,
                }}
              >
                {/* Header row */}
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
                  <React.Fragment key={theme}>
                    <div className="text-[11px] text-white/60 font-medium flex items-center pr-3 h-7">
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
                            backgroundColor:
                              count > 0
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
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none">
                              <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
                                <p className="text-[10px] text-white/90 font-medium">
                                  {theme} — {era}
                                </p>
                                <p className="text-[9px] text-white/50">
                                  {count > 0 ? `${count} song${count !== 1 ? 's' : ''}` : 'No matches'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/40 text-center py-8">No theme data found in lyrics.</p>
        )}
      </div>

      {/* ===== 4. Sentiment Arc ===== */}
      <div className="bg-[#0e0e16] border-l-2 border-l-pink-500/20 border border-white/[0.04] rounded-xl p-4 md:p-6">
        <h3 className="text-base font-bold text-white/85 mb-1">Sentiment Score Across Albums</h3>
        <p className="text-[10px] text-white/30 mb-4">
          Average emotional tone per album — positive (above line) vs negative (below line)
        </p>

        {sentimentArc.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={sentimentArc}
              margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
            >
              <defs>
                <linearGradient id="moodArcFillPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BORAHAE_COLORS.PRIMARY} stopOpacity={0.5} />
                  <stop offset="50%" stopColor={BORAHAE_COLORS.PRIMARY} stopOpacity={0.15} />
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
                stroke={BORAHAE_COLORS.PRIMARY}
                strokeWidth={2}
                fill="url(#moodArcFillPos)"
                dot={{ fill: BORAHAE_COLORS.PRIMARY, r: 4, strokeWidth: 0 }}
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

      {/* ===== 5. Word Cloud ===== */}
      <ChartSection title="Most Used Words" variant="subtle">
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
      </ChartSection>
    </div>
  );
}
