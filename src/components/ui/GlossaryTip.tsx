import { useState } from 'react';

const GLOSSARY: Record<string, string> = {
  era: 'Album era (e.g. Love Yourself, Wings)',
  komca: 'Official Korean songwriting credits',
  valence: 'How happy a song sounds (0-1)',
  energy: 'How intense a song feels (0-1)',
  danceability: 'How danceable (0-1)',
  acousticness: 'How acoustic vs. electronic (0-1)',
  sentiment: 'Dominant emotion (Joy, Pain, Hope, etc.)',
  bpm: 'Tempo in beats per minute',
  'title track': 'Lead single with music video',
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
