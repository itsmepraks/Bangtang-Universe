# 🌌 BTS Neural Archive

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Portfolio-purple)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg)](https://prettier.io/)

> *"You are my galaxy, my cosmos, my universe."*

An immersive, cosmic-themed web application that serves as a digital archive and analytical hub for BTS's musical universe. Built with React, TypeScript, and Vite, this project combines data visualization, music analysis, and artistic presentation in a unique purple-ocean aesthetic inspired by *Mikrokosmos* and *Whalien 52*.

[✨ Features](#-features) • [🚀 Getting Started](#-getting-started) • [📖 Documentation](#-documentation) • [🤝 Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎵 Sonic Analysis Lab
- **Live Waveform Visualization**: Real-time audio frequency analysis with dynamic visualizations
- **Music Metrics Dashboard**: Track BPM, energy, valence, and emotional sentiment across the discography
- **Interactive Player Controls**: Play, pause, and analyze tracks with smooth animations

### 🔍 RAG (Retrieval-Augmented Generation) Archive
- **Semantic Search Engine**: Find songs, lyrics, and themes across the BTS catalog
- **Neural Network Visualization**: Visual graph representation of song connections and relationships
- **Context-Aware Results**: Intelligent matching based on themes, emotions, and lyrical content

### 📊 Data Hub
- **Comprehensive Database**: 245+ records of BTS discography with detailed metadata
- **Advanced Filtering**: Sort and filter by album, BPM, energy levels, and emotional indices
- **Export Functionality**: Download archive data for further analysis

### 👤 Member DNA Profiles
- **Individual Artist Profiles**: Deep-dive into each member's contributions and achievements
- **KOMCA Credit Tracking**: Verified production and composition credits
- **Solo Discography**: Complete catalog of individual releases and features
- **Milestone Archives**: Key achievements and career highlights

### 🎨 Aesthetic Features
- **3D Cosmic Universe**: Fully animated starfield with "Borahae" color palette
- **Purple Ocean Effect**: Layered bokeh lights representing ARMY bombs
- **Whalien 52 Constellation**: Animated whale constellation swimming through space
- **Glass Morphism UI**: Modern glassmorphic panels with soft glows and nebula textures
- **Shooting Stars & Particles**: Dynamic floating elements for immersive atmosphere

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** v18 or higher (see `.nvmrc` for exact version)
- **npm** or **yarn** package manager
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/itsmepraks/BTS-universe.git

# Navigate to project directory
cd BTS-universe

# Install dependencies
npm install
# or using yarn
yarn install

# Copy environment variables (optional)
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Lint codebase with ESLint |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center"><b>Frontend</b></td>
<td align="center"><b>Tooling</b></td>
<td align="center"><b>Styling</b></td>
</tr>
<tr>
<td>

- React 19.2
- TypeScript 5.9
- React Compiler

</td>
<td>

- Vite 7.2
- ESLint
- Prettier

</td>
<td>

- Tailwind CSS 4.1
- Lucide React
- CSS Animations

</td>
</tr>
</table>

---

## 📁 Project Structure

```
BTS-universe/
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Component styles
│   ├── index.css            # Global styles & Tailwind
│   ├── main.tsx             # Application entry point
│   ├── constants/           # Color schemes and constants
│   │   └── colors.ts        # Borahae color palette
│   ├── types/               # TypeScript type definitions
│   │   └── types.ts         # Central type definitions
│   ├── utils/               # Helper functions and utilities
│   │   ├── helpers.ts       # General utility functions
│   │   └── animations.ts    # Animation utilities
│   └── assets/              # Static assets
├── docs/                    # Documentation
│   └── API.md              # Utility functions API reference
├── public/                  # Public static files
├── .github/                 # GitHub templates and workflows
├── AESTHETIC_PLAN.md        # Design philosophy & roadmap
├── CONTRIBUTING.md          # Contribution guidelines
├── CHANGELOG.md             # Project version history
├── SECURITY.md              # Security policy
├── CODE_OF_CONDUCT.md       # Community guidelines
├── .env.example             # Environment variable template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

---

## 🎨 Design Philosophy

The application is designed around the cosmic and emotional themes found in BTS's music, particularly:

- **Mikrokosmos**: The idea that every individual is their own small cosmos
- **Whalien 52**: Themes of connection, loneliness, and finding your frequency
- **Purple Ocean**: ARMY's signature purple color representing unity and support

The UI balances functional data visualization with dreamy, emotional aesthetics - creating a "digital memory" or "cosmic archive" feel.

### Color Palette: "Borahae" 보라해

Our color system is built around V's iconic phrase "Borahae" (I Purple You):

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Purple | `#A855F7` | Main accent, interactive elements |
| Light Purple | `#D8B4FE` | Soft highlights, hover states |
| Indigo | `#818CF8` | Cool tones, secondary elements |
| Violet | `#C084FC` | Warm tones, emphasis |
| Dark Purple | `#7E22CE` | Deep shadows, contrast |

---

## 🌟 Key Components

### Universe3D
The persistent 3D background featuring:
- 800+ dynamically positioned stars with "Borahae" color variations
- Animated nebula layers
- The seven members as a central constellation
- The ARMY represented as the purple ocean of stars

### Landing Ritual
The entry experience featuring:
- Animated BTS logo as the gateway
- Orbital member connection points
- Smooth warp transition to dashboard

### Dashboard Modules
- **Mission Control**: Overview with live analytics
- **Sonic Lab**: Music analysis and visualization
- **Archive Graph**: RAG-powered search interface
- **Records Hub**: Complete database browser

---

## 📖 Documentation

- **[API Reference](docs/API.md)** - Complete utility functions documentation
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Aesthetic Plan](AESTHETIC_PLAN.md)** - Design roadmap and visual philosophy
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Security Policy](SECURITY.md)** - Security guidelines and reporting
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards

---

## 🚢 Deployment

### Building for Production

```bash
# Build the project
npm run build

# Preview the build locally
npm run preview
```

The build output will be in the `dist/` directory.

### Deployment Platforms

This project can be deployed to various platforms:

#### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/itsmepraks/BTS-universe)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/itsmepraks/BTS-universe)

```bash
# Build command
npm run build

# Publish directory
dist
```

#### GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

### Environment Variables

For production deployment, configure the following environment variables:

```bash
VITE_APP_ENV=production
VITE_APP_BASE_URL=https://your-domain.com
# See .env.example for full list
```

---

## 🤝 Contributing

Contributions are welcome! We appreciate your interest in improving the BTS Neural Archive.

### Ways to Contribute

- 🐛 **Report bugs** - Open an issue with detailed information
- ✨ **Suggest features** - Share your ideas for enhancements
- 📝 **Improve documentation** - Help make docs clearer and more comprehensive
- 💻 **Submit code** - Fix bugs or implement features
- 🎨 **Design improvements** - Enhance the UI/UX

### Getting Started

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on our code of conduct and development process.

### Development Guidelines

- Follow the existing code style and component patterns
- Maintain TypeScript type safety
- Test across different screen sizes
- Keep accessibility in mind (WCAG 2.1 AA)
- Update documentation as needed

### Code Quality

This project maintains high standards through:
- ✅ Comprehensive TypeScript type definitions
- ✅ ESLint configuration for code quality
- ✅ Consistent coding standards via EditorConfig
- ✅ Automated CI/CD workflows
- ✅ Code review process

---

## 📊 Project Status

- **Current Version**: 0.0.0
- **Status**: Active Development
- **Last Updated**: January 2026

### Roadmap

See [AESTHETIC_PLAN.md](AESTHETIC_PLAN.md) for the complete development roadmap.

---

## 📝 License

This project is a personal portfolio piece created for educational and demonstration purposes. It is **not licensed for commercial use**.

**Copyright © 2026 Prakriti Bista**

This project is built with admiration for BTS and their music. All BTS-related content, names, and trademarks belong to their respective owners (BigHit Music/HYBE).

---

## 🔒 Security

We take security seriously. If you discover a security vulnerability, please:

1. **Do not** open a public issue
2. Email details to: hello@praks.me
3. Include steps to reproduce if possible

See [SECURITY.md](SECURITY.md) for more details.

---

## 🙏 Acknowledgments

- **BTS (방탄소년단)** for the incredible music, inspiration, and the concept of "Borahae"
- **ARMY** for creating the beautiful purple ocean
- **V (Kim Taehyung)** for coining "Borahae" (보라해) - I Purple You
- The React and TypeScript communities for excellent tools and resources
- All contributors who help improve this project

---

## 📧 Contact

**Prakriti Bista**

- 🐙 GitHub: [@itsmepraks](https://github.com/itsmepraks)
- 🌐 Website: [praks.me](https://praks.me)
- 📍 Location: Washington DC
- 💼 Role: MS CS @ George Washington University

---

<div align="center">

### Made with 💜 for BTS & ARMY

**"어떤 빛이 맞는 빛일까"**  
*(Which light would be the right one?)*  
— Mikrokosmos

**"보라해"**  
*(I Purple You)*  
— V

---

⭐ **If you like this project, please consider giving it a star!**

[Report Bug](https://github.com/itsmepraks/BTS-universe/issues) • [Request Feature](https://github.com/itsmepraks/BTS-universe/issues) • [Discussions](https://github.com/itsmepraks/BTS-universe/discussions)

</div>
