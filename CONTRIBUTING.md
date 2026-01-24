# 💜 Contributing to BTS Neural Archive

First off, thank you for considering contributing to the BTS Neural Archive! This project is a labor of love, combining data visualization with the artistry and emotion of BTS's music.

## 🌟 Code of Conduct

### Our Pledge

In the spirit of BTS's message of self-love and acceptance, we pledge to make participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers warmly
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## 🚀 Getting Started

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/BTS-universe.git
   cd BTS-universe
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/itsmepraks/BTS-universe.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic

3. **Test thoroughly**
   - Test across different screen sizes
   - Check for console errors
   - Verify animations are smooth

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-new-feature
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots if applicable

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(sonic-lab): add real-time spectrum analyzer
fix(member-dna): correct KOMCA credit display for J-Hope
docs(readme): update installation instructions
style(app): improve glass panel border styling
refactor(universe): extract star generation to utility function
perf(waveform): optimize animation frame rate
```

## 🎨 Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define interfaces for all props and state
- Avoid `any` type - use `unknown` if necessary
- Use meaningful variable and function names

```typescript
// ✅ Good
interface MemberProfileProps {
  memberId: string;
  onClose: () => void;
  accentColor?: string;
}

const MemberProfile: React.FC<MemberProfileProps> = ({ memberId, onClose }) => {
  // Implementation
};

// ❌ Avoid
function Thing(props: any) {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use `useMemo` and `useCallback` for expensive operations

```typescript
// ✅ Good - Memoized expensive calculation
const stars = useMemo(() => {
  return [...Array(800)].map(() => ({
    x: Math.random() * 1000,
    y: Math.random() * 1000,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  }));
}, []);

// ❌ Avoid - Recalculated on every render
const stars = [...Array(800)].map(() => ({ ... }));
```

### CSS & Styling

- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Use CSS variables for colors when needed
- Maintain the cosmic/glassmorphic aesthetic

```tsx
// ✅ Good - Tailwind utilities with consistent styling
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-700">
  {/* Content */}
</div>

// ❌ Avoid - Inline styles (unless dynamic)
<div style={{ background: 'rgba(255,255,255,0.05)', padding: '32px' }}>
  {/* Content */}
</div>
```

### Naming Conventions

- **Components**: PascalCase (`MemberProfile`, `SonicAnalyzer`)
- **Files**: Same as component name (`MemberProfile.tsx`)
- **Functions**: camelCase (`handleClick`, `formatDuration`)
- **Constants**: UPPER_SNAKE_CASE (`MEMBER_DATA`, `SONG_DATABASE`)
- **Interfaces**: PascalCase with descriptive names (`MemberProfileProps`)

## 🎯 Areas to Contribute

### 🐛 Bug Fixes

- Report bugs with detailed reproduction steps
- Include screenshots or screen recordings
- Check if the issue exists in the latest version

### ✨ New Features

Before implementing a new feature:
1. Open an issue to discuss it
2. Wait for approval/feedback
3. Keep the feature aligned with the project's aesthetic

Ideas for features:
- Mobile responsive optimizations
- Spotify API integration for real track data
- Interactive BTS timeline
- Lyric analysis visualization
- Fan art gallery integration
- Accessibility improvements

### 📚 Documentation

- Improve README clarity
- Add code comments
- Create tutorials or guides
- Fix typos and grammatical errors

### 🎨 Design Improvements

- Enhance animations
- Improve color schemes
- Optimize loading states
- Add micro-interactions

### ⚡ Performance Optimization

- Reduce bundle size
- Optimize animations (use `transform` and `opacity`)
- Implement code splitting
- Add lazy loading for heavy components

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Test on Chrome, Firefox, Safari, and Edge
- [ ] Test responsive behavior (mobile, tablet, desktop)
- [ ] Verify animations are smooth (60fps)
- [ ] Check for console errors/warnings
- [ ] Test keyboard navigation
- [ ] Verify color contrast for accessibility
- [ ] Test with slow internet connection

### Performance Testing

- Use Chrome DevTools Performance tab
- Aim for consistent 60fps during animations
- Keep bundle size reasonable (< 500KB gzipped)
- Lighthouse score should be > 90

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--purple-primary: #A855F7;
--purple-light: #D8B4FE;
--purple-dark: #7E22CE;

/* Background */
--bg-space: #020005;
--bg-nebula: rgba(88, 28, 135, 0.4);

/* Member Colors */
--rm-blue: #2563EB;
--jin-pink: #EC4899;
--suga-green: #10B981;
--jhope-red: #EF4444;
--jimin-gold: #F59E0B;
--v-green: #22c55e;
--jk-purple: #8B5CF6;

/* UI Elements */
--glass-bg: rgba(255, 255, 255, 0.02);
--glass-border: rgba(255, 255, 255, 0.05);
--text-primary: rgba(255, 255, 255, 0.9);
--text-secondary: rgba(255, 255, 255, 0.4);
```

### Animation Principles

1. **Smooth and Slow**: Use durations of 500-1000ms for most transitions
2. **Easing**: Prefer `ease-out` for entrances, `ease-in-out` for continuous
3. **Performance**: Animate only `transform` and `opacity` when possible
4. **Purposeful**: Every animation should enhance UX, not distract

### Typography

- **Headers**: Thin/Light weights with wide letter-spacing
- **Body**: Regular weight with comfortable line-height
- **Labels**: Small caps with wide tracking for futuristic feel
- **Mono**: Use for technical data (BPM, IDs, metrics)

## 🔍 Code Review Process

### What We Look For

1. **Code Quality**
   - Readable and maintainable
   - Follows project conventions
   - No unnecessary complexity

2. **TypeScript**
   - Proper type definitions
   - No type errors
   - Minimal use of `any`

3. **Performance**
   - No performance regressions
   - Efficient algorithms
   - Proper memoization

4. **Aesthetics**
   - Matches existing design language
   - Smooth animations
   - Consistent spacing and sizing

5. **Accessibility**
   - Keyboard navigable
   - Proper ARIA labels
   - Sufficient color contrast

## 🎓 Learning Resources

### React & TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### CSS & Animations
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [CSS Tricks - Animation Guide](https://css-tricks.com/almanac/properties/a/animation/)
- [Glassmorphism Design](https://hype4.academy/tools/glassmorphism-generator)

### Performance
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

## 💬 Communication

### Questions?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Request Comments**: For code-specific discussions

### Response Time

This is a personal project, so responses may take a few days. Please be patient! 💜

## 🙏 Thank You!

Every contribution, no matter how small, is valuable. Whether you're fixing a typo, adding a feature, or just sharing feedback - thank you for being part of this project!

*"작은 것들을 위한 시 (A poem for small things)"* — BTS

---

<div align="center">

**Made with 💜 for BTS & ARMY**

*Let's create something beautiful together*

</div>
