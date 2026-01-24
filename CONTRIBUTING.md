# Contributing to BTS Neural Archive

First off, thank you for considering contributing to the BTS Neural Archive! 💜

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Project Architecture](#project-architecture)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project follows the principles of respect, inclusivity, and collaboration inspired by BTS and ARMY values. Be kind, be respectful, and help create a positive environment for everyone.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork the repository** to your GitHub account

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/BTS-universe.git
   cd BTS-universe
   ```

3. **Add the upstream repository:**
   ```bash
   git remote add upstream https://github.com/itsmepraks/BTS-universe.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to `http://localhost:5173`

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `style/` - UI/styling changes
- `test/` - Adding or updating tests

### Keeping Your Fork Updated

Regularly sync your fork with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- Define proper interfaces and types
- Avoid using `any` - use `unknown` if type is truly unknown
- Enable strict mode in TypeScript config

Example:
```typescript
interface Member {
  id: string;
  name: string;
  full: string;
  color: string;
  role: string;
}

const getMember = (id: string): Member | undefined => {
  return MEMBER_DATA.find(m => m.id === id);
};
```

### React Components

- Use **functional components** with hooks
- Prefer **named exports** for components
- Use `React.FC` or explicit typing for props
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  );
};
```

### Styling

- Use **Tailwind CSS** utility classes
- Follow the existing color palette (Borahae purple theme)
- Maintain responsive design principles
- Use CSS modules or styled-components for complex styles

Color palette:
```css
--purple-primary: #A855F7
--purple-light: #D8B4FE
--purple-accent: #818CF8
--deep-space: #020005
```

### File Organization

Keep files organized and modular:

```
src/
├── components/        # Reusable components
│   ├── Universe/      # Universe-related components
│   ├── Dashboard/     # Dashboard modules
│   └── UI/            # Generic UI components
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── hooks/             # Custom React hooks
├── constants/         # Constants and config
└── data/              # Static data
```

### Code Quality

- **ESLint**: Ensure no linting errors before committing
  ```bash
  npm run lint
  ```

- **Type checking**: Run TypeScript compiler
  ```bash
  tsc --noEmit
  ```

- **Formatting**: Use consistent formatting (Prettier recommended)

## Project Architecture

### Key Concepts

1. **Component Hierarchy:**
   - `App.tsx` - Main application orchestrator
   - `Universe3D` - Persistent background layer
   - `LandingRitual` - Entry experience
   - Dashboard modules (SonicLab, RAG, DataHub, etc.)

2. **State Management:**
   - Local state with `useState` for component-specific data
   - Consider Context API for deeply nested state
   - Memoization for performance optimization

3. **Animation Philosophy:**
   - Smooth, cosmic-themed transitions
   - Use CSS animations for performance
   - Maintain 60fps for scrolling and interactions

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(sonic-lab): add real-time BPM detection

Implement live BPM analysis using Web Audio API. The waveform
now updates dynamically based on actual audio input.

Closes #23
```

```bash
fix(member-profile): correct KOMCA credit calculation

The previous calculation was using outdated data. Updated to
reflect current KOMCA registry information.
```

```bash
docs(readme): update installation instructions

Added troubleshooting section for common setup issues.
```

## Pull Request Process

### Before Submitting

1. **Test your changes thoroughly**
   - Run `npm run dev` and manually test
   - Check responsive behavior
   - Test in multiple browsers if possible

2. **Run quality checks:**
   ```bash
   npm run lint
   npm run build
   ```

3. **Update documentation** if needed
   - Update README.md for new features
   - Add JSDoc comments for new functions
   - Update AESTHETIC_PLAN.md for design changes

### Submitting Your PR

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear, descriptive title
   - Detailed description of changes
   - Screenshots/videos for UI changes
   - Reference to related issues

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of what this PR does

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Changes Made
   - Change 1
   - Change 2

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Testing
   How has this been tested?

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No console errors
   ```

### Review Process

- PRs require at least one review
- Address all review comments
- Keep discussions professional and constructive
- Update your PR based on feedback

## Areas for Contribution

### High Priority
- Performance optimization for 3D starfield
- Accessibility improvements (ARIA labels, keyboard navigation)
- Mobile responsiveness enhancements
- Loading states and error handling

### Feature Ideas
- Actual Spotify API integration for real music data
- User preferences/settings persistence
- Light/dark mode toggle (while maintaining aesthetic)
- Enhanced search algorithms
- Member profile photo integration
- Real-time lyrics display

### Documentation
- Component API documentation
- Architecture diagrams
- Tutorial videos or GIFs
- Translation of UI text

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion in GitHub Discussions
- Reach out to [@itsmepraks](https://github.com/itsmepraks)

## Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes for significant contributions

---

Thank you for contributing to the BTS Neural Archive! Together, we create something beautiful. 💜

*"You've shown me I have reasons, I should love myself" - BTS, Answer: Love Myself*
