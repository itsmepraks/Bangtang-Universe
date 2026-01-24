# Contributing to BTS Neural Archive

Thank you for your interest in contributing to the BTS Neural Archive! This document provides guidelines and information for contributors.

## 🌟 Getting Started

### Prerequisites
- Node.js v18 or higher
- Git
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/BTS-universe.git
   cd BTS-universe
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/itsmepraks/BTS-universe.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### Reporting Bugs
- Check if the bug has already been reported in Issues
- If not, create a new issue with:
  - Clear, descriptive title
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots if applicable
  - Your environment (browser, OS, etc.)

### Suggesting Enhancements
- Check if the enhancement has already been suggested
- Create an issue with:
  - Clear description of the feature
  - Use cases and benefits
  - Mockups or examples if applicable

### Code Contributions

#### Branch Naming Convention
- `feat/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates
- `style/description` - UI/styling changes

#### Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly:
   ```bash
   npm run build
   npm run lint
   ```

4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add new sonic visualization mode"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define interfaces for component props and data structures
- Avoid `any` type - use proper typing
- Use type inference where appropriate

```typescript
// ✅ Good
interface MemberProps {
  id: string;
  name: string;
  color: string;
}

// ❌ Avoid
const member: any = { ... }
```

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use meaningful component and prop names

```typescript
// ✅ Good
const MemberProfile: React.FC<MemberProfileProps> = ({ member }) => {
  // Component logic
}

// ❌ Avoid
function Comp(props: any) {
  // Component logic
}
```

### Styling
- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Use CSS variables for theme colors
- Maintain responsive design principles

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-all">

// ❌ Avoid inline styles unless absolutely necessary
<div style={{ display: 'flex', padding: '24px' }}>
```

### File Organization
- One component per file (unless tightly coupled)
- Group related utilities and helpers
- Keep files under 500 lines when possible
- Use barrel exports for cleaner imports

## 🎨 Design Principles

### Aesthetic Guidelines
- Maintain the cosmic, dreamy "Mikrokosmos" theme
- Use the "Borahae" purple color palette consistently
- Balance functional UI with artistic presentation
- Ensure smooth animations and transitions

### Color Palette
- Primary Purple: `#A855F7`
- Light Purple: `#D8B4FE`
- Indigo: `#818CF8`
- Dark Purple: `#581c87`
- Background: `#020005`

### Performance
- Optimize heavy animations using `useMemo` and `useCallback`
- Lazy load heavy components
- Keep bundle size reasonable
- Test on lower-end devices

## 🧪 Testing Guidelines

- Test on multiple browsers (Chrome, Firefox, Safari)
- Verify responsive behavior on different screen sizes
- Check accessibility (keyboard navigation, screen readers)
- Ensure no console errors or warnings

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Ensure all tests pass** and code is linted
3. **Provide clear PR description**:
   - What changes were made
   - Why the changes were needed
   - Screenshots/videos if UI changes
   - Related issues (if any)

4. **Be responsive to feedback**
5. **Keep PR focused** - one feature/fix per PR

### PR Title Format
```
type: short description

Types: feat, fix, refactor, docs, style, perf, test, chore
```

Examples:
- `feat: add dark mode toggle`
- `fix: resolve waveform animation lag`
- `docs: update installation instructions`

## 🎵 Data Contributions

### Adding Songs
When adding new songs to the database:
- Include accurate metadata (BPM, album, year)
- Verify emotional sentiment classifications
- Maintain consistent formatting
- Source from official releases

### Member Information
- Keep KOMCA credits updated
- Include verified achievements only
- Maintain professional tone in bios

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Celebrate contributions of all sizes

## 💜 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Special acknowledgment section (for major contributions)

## 📞 Questions?

- Open a GitHub Discussion for general questions
- Create an issue for bug reports or feature requests
- Check existing documentation first

---

Thank you for contributing to the BTS Neural Archive! Together, we're building something beautiful. 💜

*"We are not seven, we are one."*
