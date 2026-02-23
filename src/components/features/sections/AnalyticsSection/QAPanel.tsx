import { useState } from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { qaService, SUGGESTED_QUESTIONS } from '../../../../services/qaService';
import type { QAResponse } from '../../../../services/qaService';
import type { Song, Album, Member, Award, ChartEntry, Concert, Collaboration, MemberEvent } from '../../../../types/database';

interface QAPanelProps {
  songs: Song[];
  albums: Album[];
  members: Member[];
  awards?: Award[];
  chartEntries?: ChartEntry[];
  concerts?: Concert[];
  collaborations?: Collaboration[];
  memberEvents?: MemberEvent[];
}

interface QAHistoryEntry {
  question: string;
  response: QAResponse;
}

function getConfidenceLabel(confidence: number): { label: string; color: string } {
  if (confidence >= 0.8) return { label: 'High', color: 'text-green-400' };
  if (confidence >= 0.5) return { label: 'Medium', color: 'text-yellow-400' };
  return { label: 'Low', color: 'text-red-400' };
}

export default function QAPanel({ songs, albums, members, awards, chartEntries, concerts, collaborations, memberEvents }: QAPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QAResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [history, setHistory] = useState<QAHistoryEntry[]>([]);

  const handleSubmit = (q?: string) => {
    const query = (q ?? question).trim();
    if (!query) return;

    const response = qaService.answer(query, {
      songs, albums, members,
      awards, chartEntries, concerts, collaborations, memberEvents,
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white/70">Ask About BTS</h3>
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
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm p-3 pr-12 w-full placeholder:text-white/30 focus:outline-none focus:border-purple-500/30"
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
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((sq) => (
          <button
            key={sq}
            onClick={() => handleSuggestionClick(sq)}
            className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06] cursor-pointer transition-all"
          >
            <Sparkles className="w-3 h-3 inline-block mr-1 opacity-50" />
            {sq}
          </button>
        ))}
      </div>

      {/* Answer Display */}
      {answer && (
        <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          {/* Current Question */}
          <p className="text-sm text-white/50 mb-2">
            &ldquo;{currentQuestion}&rdquo;
          </p>

          {/* Answer Text */}
          <p className="text-base text-white/80 leading-relaxed">{answer.text}</p>

          {/* Confidence Badge */}
          {(() => {
            const { label, color } = getConfidenceLabel(answer.confidence);
            return (
              <span className={`text-xs ${color}`}>
                Confidence: {label} ({(answer.confidence * 100).toFixed(0)}%)
              </span>
            );
          })()}

          {/* Ranking / List Table */}
          {(answer.type === 'ranking' || answer.type === 'list') && answer.data && answer.data.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left">
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
          {answer.type === 'stat' && answer.data && answer.data.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
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
          {answer.type === 'comparison' && answer.data && answer.data.length > 0 && (
            <div className="mt-4 space-y-3">
              {(() => {
                // Extract member names from data keys (exclude 'stat')
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
                              <span className="text-white/40">{String(row.stat)}</span>
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
          <h4 className="text-xs font-medium text-white/30 uppercase tracking-wider">
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
                className="w-full text-left bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 hover:bg-white/[0.04] transition-colors"
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
  );
}
