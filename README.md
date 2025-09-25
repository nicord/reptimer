# RepTimer - HIIT Interval Timer

A production-ready Progressive Web App (PWA) for HIIT (High-Intensity Interval Training) workouts. RepTimer provides accurate timing, audio/voice cues, and a responsive interface that works seamlessly across desktop and mobile devices.

![RepTimer Screenshot](https://via.placeholder.com/800x400/1F2937/4ADE80?text=RepTimer+HIIT+Timer)

## ✨ Features

### Core Timer Functionality
- ⏱️ **Millisecond-precision timing** with drift compensation using `requestAnimationFrame`
- 🎵 **Audio cues** with Web Audio API for interval transitions and 3-2-1 countdowns
- 🗣️ **Voice announcements** using Web Speech API to announce interval names
- ⌨️ **Keyboard shortcuts** for hands-free operation
- 📱 **Mobile-optimized** with screen wake lock support

### 4-Week Progression Program
- 📅 **Built-in presets** with 4 progressive workout weeks
- 💪 **5 core exercises**: Push-ups, Dumbbell Shoulder Press, Bent-over Dumbbell Row, Diamond Push-ups, Dumbbell Lateral Raise
- ⏰ **Progressive timing**: Week 1 (40s/20s), Week 2 (40s/20s), Week 3 (45s/15s), Week 4 (45s/15s)
- 🔥 **Increasing intensity**: 2-4 rounds progression with varied warm-up and cool-down periods

### Customization & Management
- ✏️ **Custom routine editor** with drag-and-drop reordering
- 📁 **Import/Export** routines as JSON files
- 🎨 **Color-coded intervals** (warmup, work, rest, finisher, cooldown)
- 💾 **Local storage** for settings and last-used routine

### Progressive Web App (PWA)
- 📲 **Installable** on mobile devices and desktop
- 🔄 **Offline-capable** with service worker caching
- 🚀 **Fast loading** with optimized bundle splitting
- 🔔 **Native app experience** with standalone display mode

### Accessibility & UX
- ♿ **WCAG compliant** with screen reader support
- ⚡ **High contrast mode** and reduced motion support
- 🎯 **Focus management** and keyboard navigation
- 🌓 **Dark/light mode** with system preference detection

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reptimer.git
   cd reptimer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
npm run preview
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|---------|
| `Space` | Start/Pause timer |
| `N` | Next interval |
| `B` | Previous interval |
| `F` | Toggle fullscreen |
| `M` | Mute/unmute audio |
| `V` | Toggle voice announcements |
| `R` | Reset timer |

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open RepTimer in your browser
2. Tap the browser menu (⋯ or Share button)
3. Select "Add to Home Screen"
4. Follow the prompts to install

### Desktop (Chrome/Edge)
1. Click the install icon (⊕) in the address bar
2. Or go to browser menu → "Install RepTimer"
3. The app will open in its own window

### Features After Installation
- ✅ Works offline after first load
- ✅ Launches like a native app
- ✅ Keeps screen awake during workouts
- ✅ Receives updates automatically

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── TimerDisplay.tsx    # Main timer interface
│   ├── TimerControls.tsx   # Control buttons
│   ├── RoutineSelector.tsx # Preset selection
│   ├── RoutineEditor.tsx   # Custom routine editor
│   └── ImportExportModal.tsx # JSON import/export
├── hooks/              # Custom React hooks
│   ├── useTimer.ts        # Timer state management
│   ├── useKeyboard.ts     # Keyboard shortcuts
│   ├── useSettings.ts     # User preferences
│   ├── useFullscreen.ts   # Fullscreen API
│   ├── useWakeLock.ts     # Screen wake lock
│   └── useAccessibility.ts # A11y features
├── utils/              # Core utilities
│   ├── timer.ts          # Timer engine with drift compensation
│   ├── audio.ts          # Web Audio API wrapper
│   ├── speech.ts         # Web Speech API wrapper
│   ├── presets.ts        # 4-week workout programs
│   ├── storage.ts        # LocalStorage management
│   └── format.ts         # Formatting utilities
├── types.ts            # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🔧 Configuration

### Timer Settings
The timer engine provides millisecond accuracy with automatic drift compensation:

```typescript
// Timer updates at ~60fps using requestAnimationFrame
const timer = new TimerEngine(onTick, onIntervalChange, onComplete)
timer.setRoutine(routine)
timer.start()
```

### Audio Configuration
Audio cues can be customized in `src/utils/audio.ts`:

```typescript
// Frequency settings for countdown beeps
const frequencies = {
  3: 600,  // 3-second warning
  2: 500,  // 2-second warning  
  1: 400,  // 1-second warning
}
```

### Voice Settings
Speech synthesis options in `src/utils/speech.ts`:

```typescript
// Voice configuration
utterance.rate = 1.0      // Speech rate
utterance.pitch = 1.0     // Voice pitch
utterance.volume = 0.8    // Audio volume
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage
- ✅ Timer engine accuracy and state management
- ✅ JSON validation and import/export
- ✅ Time formatting and parsing utilities
- ✅ Local storage error handling
- ✅ Accessibility compliance

## 🚀 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA: `/*  /index.html  200`

### Vercel
1. Connect your GitHub repository
2. Vercel auto-detects Vite configuration
3. Deploy automatically on push to main

### GitHub Pages
1. Install gh-pages: `npm install -D gh-pages`
2. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run build && npm run deploy`

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Build and deploy: `npm run build && firebase deploy`

## 🎯 Routine Format

Routines are defined as JSON arrays with the following structure:

```json
[
  {
    "label": "Push-ups — Round 1",
    "duration": 40,
    "type": "work",
    "color": "#86EFAC"
  },
  {
    "label": "Rest — Round 1", 
    "duration": 20,
    "type": "rest",
    "color": "#BAE6FD"
  }
]
```

### Interval Types
- `warmup` - Preparation phase (yellow)
- `work` - High-intensity exercise (green)
- `rest` - Recovery period (blue)
- `finisher` - Final challenge (pink)
- `cooldown` - Recovery phase (purple)

### Validation Rules
- `label`: Non-empty string
- `duration`: Positive integer (seconds)
- `type`: One of the valid interval types
- `color`: Optional hex color (#RRGGBB format)

## 🛠️ Development

### Code Quality
```bash
npm run lint          # ESLint checking
npm run lint:fix      # Auto-fix linting issues
npm run format        # Prettier formatting
```

### Build Analysis
```bash
npm run build         # Production build
npm run preview       # Preview production build
```

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with PWA plugin
- **Styling**: Tailwind CSS with dark mode
- **Icons**: Heroicons React
- **Testing**: Vitest with jsdom
- **PWA**: Workbox service worker

## 🔧 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| PWA Installation | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| Speech Synthesis | ✅ | ✅ | ✅ | ✅ |
| Wake Lock API | ✅ | ❌ | ❌ | ✅ |
| Fullscreen API | ✅ | ✅ | ✅ | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with tests
4. Run quality checks: `npm run lint && npm test`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a Pull Request

### Development Guidelines
- Write tests for new features
- Follow TypeScript strict mode
- Use semantic commit messages
- Ensure accessibility compliance
- Test on mobile devices

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web Audio API** for precise audio timing
- **Web Speech API** for voice synthesis
- **Workbox** for PWA service worker
- **Tailwind CSS** for responsive design
- **Heroicons** for beautiful UI icons

---

**RepTimer** - Built with ❤️ for fitness enthusiasts who want accurate, distraction-free interval training.

[🌐 Live Demo](https://your-deployment-url.com) | [📱 Install PWA](https://your-deployment-url.com) | [🐛 Report Issues](https://github.com/yourusername/reptimer/issues)
