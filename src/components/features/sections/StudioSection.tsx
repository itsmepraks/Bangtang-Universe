import { Suspense, lazy } from 'react';
import { Mic2, Download, Bot, MessageSquare } from 'lucide-react';
import type { Song, Member, Album } from '../../../types/database';
import { GlassHUD } from '../../layout/GlassHUD';
import { exportFullArchive } from '../../../services/exportService';
import Badge from '../../ui/Badge';

const LyricistAI = lazy(() => import('../LyricistAI'));

interface StudioSectionProps {
  songs: Song[];
  members: Member[];
  albums: Album[];
}

export default function StudioSection({ songs, members, albums }: StudioSectionProps) {
  return (
    <div className="space-y-6">
      {/* Lyric Generator — full width */}
      <GlassHUD title="Lyricist AI" icon={Mic2}>
        <div className="max-w-3xl">
          <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>}>
            <LyricistAI />
          </Suspense>
        </div>
      </GlassHUD>

      {/* Bottom row: Export + Placeholders */}
      <div className="grid grid-cols-3 gap-6">
        {/* Export Panel */}
        <GlassHUD title="Data Export" icon={Download}>
          <div className="space-y-4">
            <p className="text-sm text-white/50 leading-relaxed">
              Export the complete archive including {songs.length} songs, {albums.length} albums, and {members.length} member profiles.
            </p>
            <button
              onClick={() => exportFullArchive(songs, members, albums)}
              className="w-full py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs font-medium uppercase tracking-wide text-purple-300 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Download size={14} />
              Export Full Archive (JSON)
            </button>
          </div>
        </GlassHUD>

        {/* AI Analysis Placeholder */}
        <GlassHUD title="AI Lyrics Analysis" icon={Bot}>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot size={32} className="text-white/20 mb-3" />
            <p className="text-sm text-white/50 font-medium">Claude API Integration</p>
            <p className="text-xs text-white/40 mt-2 max-w-sm leading-relaxed">
              Analyze song lyrics for themes, sentiments, literary devices, and cross-references.
            </p>
            <Badge variant="purple" size="sm">Coming Soon</Badge>
          </div>
        </GlassHUD>

        {/* RAG Chat Placeholder */}
        <GlassHUD title="AI Chat" icon={MessageSquare}>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare size={32} className="text-white/20 mb-3" />
            <p className="text-sm text-white/50 font-medium">RAG-powered Chat</p>
            <p className="text-xs text-white/40 mt-2 max-w-sm leading-relaxed">
              Ask questions about BTS discography, lyrics, production credits, and more.
            </p>
            <Badge variant="purple" size="sm">Coming Soon</Badge>
          </div>
        </GlassHUD>
      </div>
    </div>
  );
}
