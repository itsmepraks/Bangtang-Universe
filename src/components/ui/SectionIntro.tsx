interface SectionIntroProps {
  description: React.ReactNode;
}

export default function SectionIntro({ description }: SectionIntroProps) {
  return (
    <p className="text-sm text-white/55 leading-relaxed max-w-3xl mb-6">
      {description}
    </p>
  );
}
