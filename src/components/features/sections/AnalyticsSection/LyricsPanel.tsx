import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { lyricsAnalyzer } from '../../../../services/lyricsAnalysisService';
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
  // Compute theme frequency (top 15)
  const themeData = useMemo(() => {
    return lyricsAnalyzer.analyzeThemes(lyrics).slice(0, 15);
  }, [lyrics]);

  // Compute word frequency (top 40)
  const wordData = useMemo(() => {
    return lyricsAnalyzer.getWordFrequency(lyrics, 40);
  }, [lyrics]);

  // Compute sentiment arc averaged per album
  const sentimentArc = useMemo(() => {
    const points = lyricsAnalyzer.analyzeSentimentArc(lyrics, songs, albums);

    // Group by album title and compute average sentiment per album
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
      fontSize: 12 + ((w.count - minCount) / range) * 20, // 12px to 32px
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

  // ------ Theme chart height ------
  const themeChartHeight = Math.max(400, themeData.length * 28);

  return (
    <div className="space-y-8">
      {/* 1. Theme Frequency */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-4">Common Themes</h3>
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
          {themeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={themeChartHeight}>
              <BarChart
                data={themeData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 100 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray={CHART_STYLES.GRID.strokeDasharray}
                  stroke={CHART_STYLES.GRID.stroke}
                />
                <XAxis
                  type="number"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="theme"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={CHART_STYLES.TOOLTIP.contentStyle}
                  labelStyle={CHART_STYLES.TOOLTIP.labelStyle}
                  cursor={CHART_STYLES.TOOLTIP.cursor}
                  formatter={(value) => [`${value} occurrences`, 'Count']}
                />
                <Bar dataKey="count" fill="#A855F7" radius={[0, 4, 4, 0]} activeBar={CHART_STYLES.BAR_ACTIVE} />
              </BarChart>
            </ResponsiveContainer>
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

      {/* 3. Sentiment Arc */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-4">
          Sentiment Score Across Albums
        </h3>
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
          {sentimentArc.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={sentimentArc}
                margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray={CHART_STYLES.GRID.strokeDasharray}
                  stroke={CHART_STYLES.GRID.stroke}
                />
                <XAxis
                  dataKey="album"
                  tick={CHART_STYLES.AXIS}
                  axisLine={false}
                  tickLine={false}
                  angle={-30}
                  textAnchor="end"
                  height={60}
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
                  formatter={(value) => [Number(value).toFixed(3), 'Avg Sentiment']}
                />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#A855F7"
                  strokeWidth={2}
                  dot={{ fill: '#A855F7', r: 4 }}
                  activeDot={{ r: 6, fill: '#C084FC' }}
                />
              </LineChart>
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
