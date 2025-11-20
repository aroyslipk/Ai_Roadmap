# AI Roadmap - 300 Day Learning Journey 🚀

Master AI and Data Science in 300 days with this comprehensive learning roadmap app. Track your progress, unlock achievements, and learn with an AI-powered assistant.

## 📱 Download Android App

**[Download Latest APK](https://github.com/aroyslipk/Ai_Roadmap/releases/latest)** 

## ✨ Features

- 📚 **300-Day Curriculum** - From Python basics to advanced AI topics
- 🎯 **Learning Paths** - Choose: Beginner, Intermediate, or Advanced
- 🏆 **Achievements & Streaks** - Gamified learning experience
- 🤖 **AI Chatbot** - Get help from GROQ-powered AI assistant
- 💬 **Group Chat** - Connect with fellow learners
- 📝 **Notes & Tasks** - Track your learning progress
- 🌙 **Dark Mode** - Easy on the eyes
- 📱 **Mobile Optimized** - Perfect for Android devices
- 🔄 **Offline Mode** - Learn anywhere, anytime

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | ![Next JS](https://img.shields.io/badge/Next-black?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Shadcn](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white) |
| **Backend** | ![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat-square&logo=Firebase&logoColor=white) (Auth, Firestore) |
| **AI Engine** | ![Groq](https://img.shields.io/badge/Groq-F54900?style=flat-square&logo=groq&logoColor=white) (Llama 3.1 Model) |
| **Mobile** | ![Capacitor](https://img.shields.io/badge/Capacitor-1199EE?style=flat-square&logo=capacitor&logoColor=white) |
## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, pnpm, or yarn

### 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/aroyslipk/Ai_Roadmap.git
   cd Ai_Roadmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your API keys:
   ```env
   NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
   NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
   ```

4. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Update `src/firebase/config.ts` with your Firebase credentials

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002)

## 🔑 Getting API Keys

### GROQ API (Free)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Create an API key
4. Copy to `.env.local`

### Google AI API (Optional)
1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Get API key
3. Copy to `.env.local`

## 📦 Building for Production

```bash
npm run build
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 👨‍💻 Author

**Anik**
- GitHub: [@aroyslipk](https://github.com/aroyslipk)
- Email: anik.byteinfo11@gmail.com

## 📄 License

MIT License - feel free to use this project for learning!

Copyright (c) 2025 Anik Roy

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide

---

Made with ❤️ for learners worldwide
