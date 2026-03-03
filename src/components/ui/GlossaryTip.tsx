import { useState } from 'react';

const GLOSSARY: Record<string, string> = {
  era: 'A musical period defined by a thematic concept — e.g., "Love Yourself" explored self-love across multiple albums.',
  komca: 'Korea Music Copyright Association — official songwriting credits registered in South Korea.',
  valence: 'Musical positivity on a 0–1 scale. High valence = happy, cheerful. Low valence = sad, melancholic.',
  energy: 'Perceived intensity and activity on a 0–1 scale. High energy = fast, loud, noisy.',
  danceability: 'How suitable a song is for dancing, based on tempo, rhythm stability, and beat strength (0–1).',
  acousticness: 'Confidence that a track is acoustic (0–1). Higher = more likely acoustic instruments.',
  sentiment: 'The dominant emotional theme of a song, classified from its lyrics — e.g., Joy, Longing, Determination.',
  bpm: 'Beats per minute — the tempo of a song. Higher BPM = faster pace.',
  'title track': 'The main promotional song of an album, typically with a music video and live performances.',
};

interface GlossaryTipProps {
  term: string;
  children?: React.ReactNode;
}

export default function GlossaryTip({ term, children }: GlossaryTipProps) {
  const [show, setShow] = useState(false);
  const definition = GLOSSARY[term.toLowerCase()];
  if (!definition) return <>{children || term}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dashed border-white/30 cursor-help">
        {children || term}
      </span>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2.5 rounded-xl text-xs leading-relaxed text-white/80 bg-[#0a0814]/95 border border-white/10 shadow-xl pointer-events-none">
          <span className="font-medium text-white/95 block mb-0.5">{term}</span>
          {definition}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45 bg-[#0a0814]/95 border-r border-b border-white/10" />
        </span>
      )}
    </span>
  );
}
