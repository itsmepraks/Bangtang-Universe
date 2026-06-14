import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Disc,
  Film,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { BTSLogo } from '../../components';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const SECTIONS = [
  { icon: Disc, label: 'Catalog', desc: 'Albums, songs, eras, solo releases, and collaborations' },
  { icon: Users, label: 'Members', desc: 'Seven artist records with credits, timelines, and solo work' },
  { icon: BarChart3, label: 'Research', desc: 'Sound, lyrics, authorship, milestones, and discovery tools' },
  { icon: Trophy, label: 'Awards', desc: 'Recognition tracked by ceremony, category, scope, and year' },
  { icon: MapPin, label: 'Tours', desc: 'Concert routes, cities, countries, venues, and scale' },
  { icon: Film, label: 'Media', desc: 'Documentaries, films, variety, reality, solo, and unit records' },
] as const;

const STEPS = [
  {
    eyebrow: 'Entry / Permanent Collection',
    title: 'Start with the collection.',
    body: 'Bangtan Universe keeps albums, songs, members, awards, tours, and media in one place. Start broad, then open the records you want to inspect.',
  },
  {
    eyebrow: 'Sections / What You Can Open',
    title: 'Each section answers a different question.',
    body: 'Use Catalog for releases, Members for artist records, Research for charts, Awards for recognition, Tours for routes, and Media for films and shows.',
  },
  {
    eyebrow: 'Ready / Begin The Walkthrough',
    title: 'Open the overview.',
    body: 'Use the top navigation, search, or any record label to move around. The overview gives you the shortest path into the full archive.',
  },
] as const;

const TOTAL_STEPS = STEPS.length;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const currentStep = STEPS[step];

  const handleComplete = useCallback(() => {
    try { localStorage.setItem('bts-onboarded', '1'); } catch { /* noop */ }
    onComplete();
  }, [onComplete]);

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else handleComplete();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKey);
    skipBtnRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus?.();
    };
  }, [handleComplete]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-hidden bg-[#100f0d] text-white animate-in fade-in duration-500"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-px bg-[#e8e0d3]/20" />
      </div>

      <button
        ref={skipBtnRef}
        onClick={handleComplete}
        aria-label="Skip onboarding"
        className="absolute right-5 top-5 z-20 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48 transition-colors hover:text-white/85"
      >
        Skip
      </button>

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex min-h-[34vh] flex-col justify-between border-b border-white/[0.08] px-6 py-7 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <BTSLogo className="h-8 w-8 text-white" />
            <div>
              <p className="text-sm font-semibold text-white/90">Bangtan Universe</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/42">Collection entry</p>
            </div>
          </div>

          <div className="my-10 max-w-xl lg:my-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a79d92]">{currentStep.eyebrow}</p>
            <h1 className="mt-4 max-w-[10ch] font-serif text-5xl font-medium leading-[0.95] tracking-normal text-[#f2eadf] sm:text-6xl lg:text-7xl">
              {currentStep.title}
            </h1>
            <p className="mt-6 max-w-[56ch] text-sm leading-7 text-white/58 sm:text-base">
              {currentStep.body}
            </p>
          </div>

          <div
            role="progressbar"
            aria-label="Onboarding progress"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step + 1}
            aria-valuetext={`Step ${step + 1} of ${TOTAL_STEPS}`}
            className="flex items-center gap-2"
          >
            {STEPS.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Go to step ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === step ? 'w-12 bg-[#b68cff]' : 'w-5 bg-white/16 hover:bg-white/28'
                }`}
              />
            ))}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col justify-center px-6 py-8 sm:px-10 lg:px-14">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SECTIONS.map(({ icon: Icon, label, desc }, index) => (
              <article
                key={label}
                className="group min-h-44 rounded-lg border border-white/[0.09] bg-white/[0.035] p-5 transition-colors hover:border-[#b68cff]/35 hover:bg-white/[0.055]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/34">Section {String(index + 1).padStart(2, '0')}</p>
                    <h2 className="mt-5 font-serif text-3xl font-medium leading-none tracking-normal text-[#f2eadf]">{label}</h2>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-md border border-white/[0.08] bg-black/20 text-[#b68cff]">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-white/55">{desc}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                step === 0 ? 'cursor-default text-white/22' : 'text-white/55 hover:text-white/82'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={next}
              className="inline-flex items-center justify-center gap-3 rounded-md border border-[#b68cff]/35 bg-[#b68cff]/12 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d9c5ff] transition-colors hover:bg-[#b68cff]/20 hover:text-white"
            >
              {step < TOTAL_STEPS - 1 ? 'Continue' : 'Enter Archive'}
              {step < TOTAL_STEPS - 1 ? <ChevronRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </main>
      </div>

      <Sparkles className="absolute bottom-8 right-8 hidden h-5 w-5 text-[#b68cff]/45 md:block" aria-hidden="true" />
    </div>
  );
}
