import { AnimatePresence, motion, type Transition } from 'framer-motion';

const animateTransition: Transition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] };
const exitTransition: Transition = { duration: 0.2 };

export default function SectionTransition({ children, sectionKey }: { children: React.ReactNode; sectionKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sectionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: animateTransition }}
        exit={{ opacity: 0, y: -10, transition: exitTransition }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
