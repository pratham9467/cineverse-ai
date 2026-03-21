<div align="center">

# CineVerse AI

### Your AI-Powered Entertainment Discovery Platform

**Discover, Connect, and Experience Entertainment Like Never Before**

[![Expo][expo-badge]][expo-url]
[![React Native][rn-badge]][rn-url]
[![TypeScript][ts-badge]][ts-url]
[![Appwrite][appwrite-badge]][appwrite-url]
[![License][license-badge]](LICENSE)

[Features](#features) • [Architecture](#architecture) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Screenshots](#screenshots) • [Contributing](#contributing)

</div>

---

## 🎯 About

**CineVerse AI** is a full-featured, cross-platform entertainment discovery app that combines **AI-powered recommendations** with **social features** to create the ultimate movie and anime companion. Built with React Native and Expo, it demonstrates advanced patterns including state management, real-time data synchronization, and seamless user experiences.

### Key Differentiators
- 🤖 **AI Recommendations** - Natural language processing with Google Gemini/Ollama
- 👥 **Social Features** - Activity feed, following, and user discovery
- ⭐ **Reviews & Ratings** - Community-driven review system with engagement
- 🔍 **Advanced Filtering** - Multi-criteria search with year, genre, rating filters
- 📚 **Collections** - Personal playlists for organized movie tracking
- 🎬 **Cross-Platform** - Single codebase for iOS, Android, and Web

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| **AI Recommendations** | Natural language queries powered by Google Gemini with fallback mechanisms |
| **Movie Discovery** | Browse trending, popular, top-rated, now playing, and upcoming movies via TMDB |
| **Anime Discovery** | Explore top and seasonal anime with detailed info from Jikan API |
| **Smart Watchlist** | Save movies and anime with status tracking (Watching, Completed) |
| **User Authentication** | Secure email/password and Google OAuth via Appwrite |
| **Dark Theme UI** | Immersive cinematic dark mode with smooth Reanimated 4 animations |

### Social Features (NEW)
| Feature | Description |
|---------|-------------|
| **Activity Feed** | See what friends are watching, rating, and reviewing |
| **Follow System** | Follow other users and build your community |
| **User Profiles** | View user stats, reviews, and activity history |
| **User Discovery** | Find and follow users with similar tastes |

### Reviews & Ratings (NEW)
| Feature | Description |
|---------|-------------|
| **Star Ratings** | Rate movies on a 5-star scale |
| **Written Reviews** | Share detailed thoughts with the community |
| **Like System** | Engage with reviews you find helpful |
| **Review Sorting** | Sort by recent or most popular |
| **Average Ratings** | See aggregated community scores |

### Advanced Search (NEW)
| Feature | Description |
|---------|-------------|
| **Year Filter** | Filter by release year (1975-2026) |
| **Genre Filter** | Multi-select genre filtering |
| **Rating Filter** | Minimum rating threshold |
| **Sort Options** | 8 sorting options (popularity, rating, date, etc.) |
| **Language Filter** | Filter by original language |
| **Adult Content Toggle** | Control explicit content visibility |

### Collections (NEW)
| Feature | Description |
|---------|-------------|
| **Custom Playlists** | Create themed movie collections |
| **Public/Private** | Share collections or keep them private |
| **Collection Management** | Add, remove, and reorder items |
| **Cover Images** | Visual collection covers |

---

## 🏗️ Architecture

### Clean Architecture Pattern
```
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── index.tsx      # Home tab
│   │   ├── discover.tsx   # Search & discovery
│   │   ├── social.tsx     # Activity feed (NEW)
│   │   ├── watchlist.tsx  # Personal watchlist
│   │   └── profile.tsx    # User profile
│   ├── aiscreen/          # AI recommendation chat
│   ├── reviews/           # Review system (NEW)
│   ├── collections/       # Collections management (NEW)
│   ├── movies/            # Movie detail screens
│   ├── anime/             # Anime detail screens
│   ├── profile/           # Profile sub-screens
│   └── auth/              # Authentication screens
├── components/            # Reusable components
│   └── FilterModal.tsx    # Advanced filter modal (NEW)
├── contexts/              # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   ├── SocialContext.tsx  # Social features (NEW)
│   ├── ReviewsContext.tsx # Reviews system (NEW)
│   └── CollectionsContext.tsx # Collections (NEW)
├── lib/                   # Utilities and API clients
│   ├── ai/                # AI service integration
│   ├── social.ts          # Social API functions (NEW)
│   ├── appwrite.ts        # Appwrite client config
│   ├── tmdb.ts            # TMDB API client
│   ├── jikan.ts           # Jikan (anime) API client
│   └── watchlist.ts       # Watchlist CRUD operations
└── assets/                # Images, fonts, static assets
```

### State Management Strategy
- **React Context** for global state (auth, social, reviews, collections)
- **Custom Hooks** for reusable logic
- **Optimistic Updates** for instant UI feedback
- **Error Boundaries** for graceful degradation

### Data Flow
```
User Action → Context Handler → API Call → Local State Update → UI Render
                    ↓
            Optimistic Update → Error Handling → Rollback if needed
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React Native 0.81** | Cross-platform mobile framework |
| **Expo SDK 54** | Development platform & tools |
| **TypeScript 5.9** | Type safety and developer experience |
| **Expo Router 6** | File-based navigation |
| **NativeWind 4** | Tailwind CSS for React Native |
| **Reanimated 4** | Smooth animations |
| **React Navigation 7** | Navigation primitives |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| **Appwrite** | Authentication, database, storage |
| **TMDB API** | Movie data and images |
| **Jikan API** | Anime data from MyAnimeList |
| **Google Gemini** | AI-powered recommendations |
| **Ollama Cloud** | Alternative AI provider |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **EAS Build** | App store builds |
| **Sentry** | Error monitoring (recommended) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Appwrite project** (self-hosted or [Appwrite Cloud](https://cloud.appwrite.io))
- **TMDB API key** ([get one here](https://www.themoviedb.org/documentation/api))
- **Google Gemini API key** ([get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cineverse-ai.git
   cd cineverse-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```env
   # TMDB API
   EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_bearer_token
   
   # Google Gemini AI
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # Appwrite
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
   EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
   EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID=your_watchlist_collection_id
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Scan QR with [Expo Go](https://expo.dev/go)

---

## 📸 Screenshots

<div align="center">

| Home | Discover | Social | AI Chat |
|:----:|:--------:|:------:|:-------:|
| ![Home](screenshots/home.png) | ![Discover](screenshots/discover.png) | ![Social](screenshots/social.png) | ![AI](screenshots/ai.png) |

| Watchlist | Reviews | Filters | Profile |
|:---------:|:-------:|:-------:|:-------:|
| ![Watchlist](screenshots/watchlist.png) | ![Reviews](screenshots/reviews.png) | ![Filters](screenshots/filters.png) | ![Profile](screenshots/profile.png) |

</div>

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run tests (when implemented)
npm test
```

---

## 📈 Performance Optimizations

- **Image Caching** - Expo Image with automatic caching
- **Lazy Loading** - Components load on demand
- **Optimistic Updates** - Instant UI feedback
- **Memoization** - React.memo for expensive renders
- **Debounced Search** - Reduced API calls
- **Circuit Breaker** - AI service resilience

---

## 🔒 Security Features

- **API Key Sanitization** - Automatic redaction in AI responses
- **Input Validation** - Query sanitization and length limits
- **Auth Guards** - Protected routes and actions
- **Error Handling** - No sensitive data in error messages

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting:
```bash
npm run lint
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - Cross-platform React Native framework
- [TMDB](https://www.themoviedb.org) - Movie and TV show data
- [Jikan](https://jikan.moe) - Unofficial MyAnimeList REST API
- [Google Gemini](https://ai.google.dev) - Generative AI for recommendations
- [Appwrite](https://appwrite.io) - Open-source backend platform
- [NativeWind](https://www.nativewind.dev) - Tailwind CSS for React Native

---

<div align="center">

**[⬆ Back to Top](#cineverse-ai)**

Made with ❤️ for entertainment enthusiasts.

</div>

<!-- Badge Links -->
[expo-badge]: https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white
[expo-url]: https://expo.dev
[rn-badge]: https://img.shields.io/badge/React_Native-0.81-blue?style=flat-square&logo=react&logoColor=white
[rn-url]: https://reactnative.dev
[ts-badge]: https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white
[ts-url]: https://www.typescriptlang.org
[appwrite-badge]: https://img.shields.io/badge/Appwrite-FD366E?style=flat-square&logo=appwrite&logoColor=white
[appwrite-url]: https://appwrite.io
[license-badge]: https://img.shields.io/badge/License-MIT-green?style=flat-square
