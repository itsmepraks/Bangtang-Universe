import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Disc,
  Users,
  BarChart3,
  Trophy,
  MapPin,
  Film,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { BTSLogo } from '../../components';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const SECTIONS = [
  { icon: Disc, label: 'Discography', desc: 'Every album, track, and audio feature across all eras' },
  { icon: Users, label: 'Members', desc: 'Profiles, credits, and career timelines for all 7 members' },
  { icon: BarChart3, label: 'Audio Analytics', desc: 'Energy, tempo, sentiment analysis, and lyrical themes' },
  { icon: Trophy, label: 'Awards', desc: 'Wins and nominations tracked across global ceremonies' },
  { icon: MapPin, label: 'World Tours', desc: 'Every concert mapped across the globe' },
  { icon: Film, label: 'Filmography', desc: 'Documentaries, reality shows, and solo projects' },
] as const;

const TOTAL_STEPS = 3;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const skipBtnRef = useRef<HTMLButtonElement>(null);

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
    if (skipBtnRef.current) skipBtnRef.current.focus();
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/95 backdrop-blur-sm animate-in fade-in duration-500"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Skip button */}
      <button
        ref={skipBtnRef}
        onClick={handleComplete}
        aria-label="Skip onboarding"
        className="absolute top-6 right-6 text-xs text-white/60 hover:text-white/80 transition-colors cursor-pointer"
      >
        Skip
      </button>

      {/* Card container */}
      <div className="relative w-full max-w-lg mx-4">
        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl shadow-purple-500/5">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white/90 mb-3">
                  Welcome to Bangtan Universe
                </h1>
                <p className="text-sm text-white/50 leading-relaxed max-w-sm mx-auto">
                  Your all-in-one data archive for BTS — the global K-pop phenomenon.
                  Everything about the group, all in one place.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: What's inside */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white/90 mb-1">
                  What's Inside
                </h2>
                <p className="text-xs text-white/65">
                  Explore 10+ years of music, data, and stories
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SECTIONS.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white/80">{label}</div>
                      <div className="text-[11px] text-white/60 leading-snug mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Ready */}
          {step === 2 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                <BTSLogo className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white/90 mb-2">
                  Ready to explore?
                </h2>
                <p className="text-sm text-white/65 max-w-xs mx-auto">
                  Dive into the complete BTS archive — discography, analytics, awards, and more.
                </p>
              </div>
              <button
                onClick={handleComplete}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-sm font-medium text-purple-300 hover:bg-purple-500/30 hover:text-purple-200 transition-all cursor-pointer"
              >
                Start Exploring
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation bar */}
          <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/[0.06]">
            {/* Back button */}
            <button
              onClick={back}
              disabled={step === 0}
              className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                step === 0
                  ? 'text-white/25 cursor-default'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {/* Step indicator — exposed as a labelled progressbar so screen
                readers announce position ("Step 2 of 3"). The dots are still
                decorative; the role lives on the wrapper. */}
            <div
              role="progressbar"
              aria-label="Onboarding progress"
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={step + 1}
              aria-valuetext={`Step ${step + 1} of ${TOTAL_STEPS}`}
              className="flex items-center gap-2"
            >
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 h-1.5 bg-purple-400'
                      : 'w-1.5 h-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Next button */}
            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={next}
                className="flex items-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="w-12" /> /* spacer to keep dots centered */
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
