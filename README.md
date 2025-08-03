# 🎯 Focus Coach - Deep Work Assistant

AI-powered focus companion with voice guidance and attention tracking. Built with React, TypeScript, and modern web technologies.

## ✨ Features

### Core Features

- 🎥 **Live Webcam Monitoring** - Tracks attention using MediaPipe face detection
- 🎤 **AI Voice Guidance** - Personalized voice prompts with ElevenLabs or Web Speech API
- ⏱️ **Smart Timer** - Customizable focus sessions (15, 25, 45, 60 min) with break timers
- 🎯 **Attention Tracking** - Auto-pause when distracted, resume when focused
- 📊 **Session Statistics** - Track completed sessions and total focus time

### Enhanced Features

- 🔔 **Browser Notifications** - Get notified when sessions start/end
- 🌊 **Ambient Sounds** - White noise and background sounds for focus
- ⌨️ **Keyboard Shortcuts** - Quick controls for power users
- ⚙️ **Advanced Settings** - Voice customization, timer settings, notifications
- 📱 **PWA Support** - Install as desktop/mobile app
- 🌙 **Dark Theme** - Beautiful glass morphism design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, or bun

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd zenith-focus-mate-62
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
bun install
```

3. **Start development server**

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Build & Deploy

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel/Netlify

```bash
# Build first
npm run build

# Deploy the dist folder
```

## 🧪 Testing

### Run Linter

```bash
npm run lint
```

### Manual Testing Checklist

1. **Basic Functionality**

   - [ ] User name input works
   - [ ] Focus timer starts/stops correctly
   - [ ] Voice prompts play (with/without ElevenLabs)
   - [ ] Webcam permission request
   - [ ] Attention tracking works

2. **Advanced Features**

   - [ ] Settings modal opens
   - [ ] Voice settings can be changed
   - [ ] Timer duration can be modified
   - [ ] Notifications work (grant permission)
   - [ ] Ambient sounds play
   - [ ] Keyboard shortcuts work

3. **Break Timer**

   - [ ] Break starts after focus session
   - [ ] Break timer shows correctly
   - [ ] Focus resumes after break
   - [ ] Break notifications work

4. **PWA Features**
   - [ ] App can be installed
   - [ ] Works offline (basic functionality)
   - [ ] App icon shows correctly

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: ElevenLabs API Key for premium voice
VITE_ELEVENLABS_API_KEY=your_api_key_here
```

### Voice Settings

- **Web Speech API**: Free, built-in browser voices
- **ElevenLabs**: Premium AI voices (requires API key)

### Timer Settings

- Focus Duration: 15, 25, 45, or 60 minutes
- Break Duration: 3, 5, 10, or 15 minutes

## 📱 PWA Installation

### Desktop

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Follow the prompts

### Mobile

1. Open the app in Safari/Chrome
2. Tap "Add to Home Screen"
3. The app will appear as a native app

## 🎨 Customization

### Voice Customization

- Speech Rate: 0.5x - 2.0x
- Voice Pitch: 0.5x - 2.0x
- Volume: 10% - 100%
- Voice Selection: Available browser voices

### UI Customization

- Dark theme (glass morphism)
- Responsive design
- Keyboard shortcuts
- Customizable settings

## 🔍 Troubleshooting

### Common Issues

1. **Webcam not working**

   - Check browser permissions
   - Ensure HTTPS in production
   - Try refreshing the page

2. **Voice not playing**

   - Check browser console for errors
   - Ensure audio permissions
   - Try different voice settings

3. **Notifications not working**

   - Grant notification permissions
   - Check browser settings
   - Ensure HTTPS in production

4. **Build errors**
   - Clear node_modules and reinstall
   - Check TypeScript version
   - Update dependencies

### Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📈 Performance Tips

1. **For better performance:**

   - Use Chrome/Edge for best Web Speech API support
   - Grant all permissions when prompted
   - Close other tabs during focus sessions
   - Use wired headphones for better audio

2. **For mobile:**
   - Install as PWA for better experience
   - Use landscape mode for larger timer
   - Enable notifications for reminders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for face detection
- [ElevenLabs](https://elevenlabs.io/) for AI voice synthesis
- [Shadcn/UI](https://ui.shadcn.com/) for beautiful components
- [Framer Motion](https://www.framer.com/motion/) for animations

---

**Made with ❤️ for productive deep work**
