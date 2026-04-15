import { useState, useMemo } from 'react';
import { Sparkles, MessageSquare, Send } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import type {
  Song,
  Album,
  Member,
  Award,
  ChartEntry,
  Concert,
  MemberEvent,
} from '../../../../types/database';
import { getRecommendations } from '../../../../services/recommendationService';
import { qaService, SUGGESTED_QUESTIONS } from '../../../../services/qaService';
import type { QAResponse } from '../../../../services/qaService';
import { CHART_STYLES, BORAHAE_COLORS } from '../../../../constants/colors';
import EmptyState from '../../../ui/EmptyState';

// ==================== TYPES ====================

interface DiscoverPanelProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards?: Award[];
  chartEntries?: ChartEntry[];
  concerts?: Concert[];
  memberEvents?: MemberEvent[];
}

interface RadarDataPoint {
  feature: string;
  selected: number;
  recommended: number;
}

interface QAHistoryEntry {
  question: string;
  response: QAResponse;
}

// ==================== HELPERS ====================

function buildRadarData(songA: Song, songB: Song): RadarDataPoint[] {
  return [
    {
      feature: 'Energy',
      selected: (songA.energy ?? 0) * 100,
      recommended: (songB.energy ?? 0) * 100,
    },
    {
      feature: 'Valence',
      selected: (songA.valence ?? 0) * 100,
      recommended: (songB.valence ?? 0) * 100,
    },
    {
      feature: 'Danceability',
      selected: (songA.danceability ?? 0) * 100,
      recommended: (songB.danceability ?? 0) * 100,
    },
    {
      feature: 'Acousticness',
      selected: (songA.acousticness ?? 0) * 100,
      recommended: (songB.acousticness ?? 0) * 100,
    },
  ];
}

function getConfidenceLabel(confidence: number): { label: string; color: string } {
  if (confidence >= 0.8) return { label: 'High', color: 'text-green-400' };
  if (confidence >= 0.5) return { label: 'Medium', color: 'text-yellow-400' };
  return { label: 'Low', color: 'text-red-400' };
}

// ==================== COMPONENT ====================

export default function DiscoverPanel({
  songs,
  albums,
  members,
  awards,
  chartEntries,
  concerts,
  memberEvents,
}: DiscoverPanelProps) {
  // ----- Recommender state -----
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);

  const selectedSong = useMemo(
    () => songs.find((s) => s.id === selectedSongId) ?? null,
    [songs, selectedSongId],
  );

  const recommendations = useMemo(() => {
    if (!selectedSong) return [];
    return getRecommendations(selectedSong, songs, albums, 8);
  }, [selectedSong, songs, albums]);

  const topRecommendation = recommendations[0] ?? null;

  const radarData = useMemo(() => {
    if (!selectedSong || !topRecommendation) return [];
    return buildRadarData(selectedSong, topRecommendation.song);
  }, [selectedSong, topRecommendation]);

  // ----- Q&A state -----
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QAResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [history, setHistory] = useState<QAHistoryEntry[]>([]);

  const handleSubmit = (q?: string) => {
    const query = (q ?? question).trim();
    if (!query) return;

    const response = qaService.answer(query, {
      songs,
      albums,
      members,
      awards,
      chartEntries,
      concerts,
      memberEvents,
    });

    setCurrentQuestion(query);
    setAnswer(response);
    setHistory((prev) => [{ question: query, response }, ...prev]);
    setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggested: string) => {
    setQuestion(suggested);
    handleSubmit(suggested);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ===== Left Column: Song Recommender ===== */}
      <div className="bg-[#0c0c14] rounded-2xl p-4 md:p-5">
        <div className="space-y-8">
          {/* Song Selector */}
          <div>
            <h3 className="text-base font-bold text-white/85 mb-4">
              Song Recommendations
            </h3>
            <select
              value={selectedSongId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSongId(val ? Number(val) : null);
              }}
              className="w-full bg-[#0c0c12] border border-white/[0.10] rounded-xl text-sm text-white/80 px-4 py-3 cursor-pointer focus:outline-none focus:border-purple-500/40 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '36px',
              }}
            >
              <option value="" style={{ background: '#0c0c12' }}>
                Select a song...
              </option>
              {songs.map((song) => (
                <option key={song.id} value={song.id} style={{ background: '#0c0c12' }}>
                  {song.title}
                </option>
              ))}
            </select>
          </div>

          {/* Empty state */}
          {!selectedSong && (
            <EmptyState
              icon={Sparkles}
              title="Pick a song to start"
              description="Pick a song. We'll find 8 that sound like it."
            />
          )}

          {/* No recommendations found */}
          {selectedSong && recommendations.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No similar songs found"
              description="Nothing close. Try a different track."
            />
          )}

          {/* Recommendations Grid */}
          {selectedSong && recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.song.id}
                  className="bg-[#0e0e16] border border-white/[0.04] rounded-xl p-4 hover:bg-[#131320] transition-colors"
                >
                  <p className="text-base font-semibold text-white/90">
                    {rec.song.title}
                  </p>
                  <p className="text-xs text-white/40 mt-1">{rec.albumTitle}</p>
                  <p className="text-sm font-mono text-purple-400 mt-2">
                    {Math.round(rec.similarity * 100)}% similar
                  </p>
                  {rec.reasons.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-fade-x mt-2 pb-0.5">
                      {rec.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/70 border border-purple-500/15 flex-shrink-0 whitespace-nowrap"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Radar Comparison */}
          {selectedSong && topRecommendation && radarData.length > 0 && (
            <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6">
              <h4 className="text-sm font-semibold text-white/70 mb-2">
                Audio Comparison
              </h4>
              <p className="text-xs text-white/40 mb-4">
                <span className="text-purple-400">{selectedSong.title}</span>
                {' vs '}
                <span className="text-indigo-400">{topRecommendation.song.title}</span>
              </p>

              <div className="min-h-[260px]">
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis
                      dataKey="feature"
                      tick={{ ...CHART_STYLES.AXIS }}
                    />
                    <Radar
                      name={selectedSong.title}
                      dataKey="selected"
                      stroke={BORAHAE_COLORS.PRIMARY}
                      fill={BORAHAE_COLORS.PRIMARY}
                      fillOpacity={0.2}
                    />
                    <Radar
                      name={topRecommendation.song.title}
                      dataKey="recommended"
                      stroke="#818CF8"
                      fill="#818CF8"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Right Column: Q&A ===== */}
      <div className="bg-gradient-to-br from-[#111118] to-[#0e0e18] border border-white/[0.05] rounded-2xl p-4 md:p-5">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white/85">Ask About BTS</h3>
            </div>
            <p className="text-xs text-white/40">
              Ask questions about the discography, members, and more
            </p>
          </div>

          {/* Input Area */}
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm p-3 pr-12 w-full placeholder:text-white/40 focus:outline-none focus:border-purple-500/30"
            />
            <button
              onClick={() => handleSubmit()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 transition-colors"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Suggested Questions */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-fade-x pb-1">
            {SUGGESTED_QUESTIONS.map((sq) => (
              <button
                key={sq}
                onClick={() => handleSuggestionClick(sq)}
                className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06] cursor-pointer transition-all"
              >
                <Sparkles className="w-3 h-3 inline-block mr-1 opacity-50" />
                {sq}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {!answer && (
            <EmptyState
              icon={MessageSquare}
              title="Ask anything about BTS"
              description="Type a question or tap a suggestion."
            />
          )}

          {/* Answer Display */}
          {answer && (
            <div className="bg-gradient-to-br from-[#111118] to-[#0e0e18] border border-white/[0.05] rounded-xl p-5 space-y-4">
              {/* Current Question */}
              <p className="text-sm text-white/50 mb-2">
                &ldquo;{currentQuestion}&rdquo;
              </p>

              {/* Answer Text */}
              <p className="text-base text-white/80 leading-relaxed">{answer.text}</p>

              {/* Confidence Badge */}
              {answer.confidence >= 0.5 && (() => {
                const { label, color } = getConfidenceLabel(answer.confidence);
                const explain =
                  label === 'High'
                    ? 'Strong match in the dataset — safe to trust.'
                    : 'Partial match — the answer may be incomplete or approximate.';
                return (
                  <span
                    className={`text-xs ${color} inline-flex items-center gap-1.5`}
                    title={explain}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${label === 'High' ? 'bg-green-400' : 'bg-yellow-400'}`}
                    />
                    {label === 'High' ? 'Confident answer' : 'Partial match'}
                  </span>
                );
              })()}

              {/* Suggestion Buttons (low confidence / fallback) */}
              {answer.confidence < 0.2 &&
                answer.data &&
                answer.data.length > 0 &&
                'suggestion' in answer.data[0] && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mt-3">
                    {answer.data.map((row, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(String(row.suggestion))}
                        className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-purple-400 hover:text-purple-300 hover:bg-white/[0.06] cursor-pointer transition-all"
                      >
                        {String(row.suggestion)}
                      </button>
                    ))}
                  </div>
                )}

              {/* Ranking / List Table */}
              {(answer.type === 'ranking' || answer.type === 'list') &&
                answer.confidence >= 0.2 &&
                answer.data &&
                answer.data.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.06] mt-4">
                    <table className="min-w-[360px] w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {Object.keys(answer.data[0]).map((key) => (
                            <th
                              key={key}
                              className="py-2 px-3 text-xs font-medium text-white/40 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {answer.data.map((row, i) => (
                          <tr key={i} className="border-b border-white/[0.03]">
                            {Object.values(row).map((val, j) => (
                              <td key={j} className="py-2 px-3 text-white/70">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* Stat Display */}
              {answer.type === 'stat' &&
                answer.data &&
                answer.data.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {answer.data.map((item, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3"
                      >
                        <div className="text-xs text-white/40">
                          {String(item.stat ?? item.type ?? '')}
                        </div>
                        <div className="text-lg font-semibold text-white/90">
                          {String(item.value ?? item.count ?? '')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Comparison Display */}
              {answer.type === 'comparison' &&
                answer.data &&
                answer.data.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {(() => {
                      const allKeys = Object.keys(answer.data[0]);
                      const memberNames = allKeys.filter((k) => k !== 'stat');

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {memberNames.map((name) => (
                            <div
                              key={name}
                              className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                            >
                              <h4 className="text-sm font-semibold text-purple-400 mb-3">
                                {name}
                              </h4>
                              <div className="space-y-2">
                                {answer.data!.map((row, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-white/40">
                                      {String(row.stat)}
                                    </span>
                                    <span className="text-white/80 font-medium">
                                      {String(row[name])}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Previous Questions
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.slice(1).map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentQuestion(entry.question);
                      setAnswer(entry.response);
                    }}
                    className="w-full text-left bg-[#0c0c14] border border-white/[0.03] rounded-lg p-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <p className="text-xs text-white/40 truncate">
                      {entry.question}
                    </p>
                    <p className="text-sm text-white/60 truncate mt-1">
                      {entry.response.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
