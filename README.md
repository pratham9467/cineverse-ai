<div align="center">

# CineVerse AI

### Your Personal AI-Powered Movie & Anime Companion

**Discover, Explore, and Get Personalized Recommendations — Powered by AI**

[![Expo][expo-badge]][expo-url]
[![React Native][rn-badge]][rn-url]
[![TypeScript][ts-badge]][ts-url]
[![Appwrite][appwrite-badge]][appwrite-url]
[![License][license-badge]](LICENSE)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Environment Variables](#environment-variables) • [Project Structure](#project-structure) • [Contributing](#contributing)

</div>

---

## About

**CineVerse AI** is a cross-platform movie and anime discovery app built with React Native and Expo. It combines real-time data from **TMDB** and **Jikan** APIs with **Google Gemini AI** to deliver intelligent, mood-based movie recommendations. Browse trending titles, manage your personal watchlist, and let AI curate the perfect pick for any mood — all from a sleek, dark-themed interface.

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Recommendations** | Describe your mood or preferences in natural language and receive 5-7 personalized movie picks powered by Google Gemini |
| **Movie Discovery** | Browse trending, popular, top-rated, now playing, and upcoming movies via TMDB |
| **Anime Discovery** | Explore top and seasonal anime with detailed info from the Jikan (MyAnimeList) API |
| **Smart Watchlist** | Save movies and anime to your watchlist, organized by status (Watching, Completed) |
| **User Authentication** | Secure email/password sign-up and Google OAuth login via Appwrite |
| **Detailed Info Pages** | View cast, crew, ratings, runtime, genres, similar titles, and more |
| **Quick Suggestions** | One-tap AI prompt suggestions like "Mind-bending like Inception" or "Dark thrillers" |
| **Cross-Platform** | Runs on iOS, Android, and Web from a single codebase |
| **Dark Theme UI** | Immersive cinematic dark mode with smooth animations |

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React Native, Expo SDK 54 |
| **Language** | TypeScript |
| **Routing** | Expo Router (file-based) |
| **Styling** | NativeWind (Tailwind CSS), React Native Reanimated |
| **Backend** | Appwrite (Auth, Database, Storage) |
| **Movie API** | The Movie Database (TMDB) |
| **Anime API** | Jikan v4 (MyAnimeList) |
| **AI Engine** | Google Gemini 1.5 Flash |
| **State** | React Context API |
| **Navigation** | React Navigation Bottom Tabs |

---

## Screenshots

<div align="center">
<img src="assets/images/logo.png" width="120" alt="CineVerse Logo" />
</div>

> _Add your screenshots here_

| Home | Discover | AI Chat | Watchlist |
|:----:|:--------:|:-------:|:---------:|
| Screenshot | Screenshot | Screenshot | Screenshot |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)
- Appwrite project (self-hosted or [Appwrite Cloud](https://cloud.appwrite.io))
- TMDB API key ([get one here](https://www.themoviedb.org/documentation/api))
- Google Gemini API key ([get one here](https://makersuite.google.com/app/apikey))

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

   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables))

4. **Start the development server**

   ```bash
   npx expo start
   ```

5. **Run on a device or emulator**

   Press `a` for Android, `i` for iOS, or `w` for web. You can also scan the QR code with [Expo Go](https://expo.dev/go).

---

## Environment Variables

Create a `.env` file in the project root:

```env
# TMDB API
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_bearer_token
EXPO_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Google Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Appwrite
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
EXPO_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID=your_watchlist_collection_id
EXPO_PUBLIC_APPWRITE_GOOGLE_REDIRECT_URI=your_redirect_uri
```

> **Note:** `EXPO_PUBLIC_` prefix is required for Expo to expose variables to the client bundle.

---

## Project Structure

```
cineverse-ai/
├── app/                      # Expo Router pages (file-based routing)
│   ├── (tabs)/               # Bottom tab navigation
│   │   ├── index.tsx         #   Home tab
│   │   ├── discover.tsx      #   Discover tab (movies + anime)
│   │   ├── watchlist.tsx     #   Watchlist tab
│   │   └── profile.tsx       #   Profile tab
│   ├── aiscreen/             # AI recommendation chat screen
│   ├── anime/                # Anime detail screens
│   ├── auth/                 # OAuth callback handlers
│   ├── authscreen/           # Login & signup screens
│   ├── movies/               # Movie detail screens
│   ├── profile/              # Profile sub-screens (preferences, account, billing)
│   ├── _layout.tsx           # Root layout with theme & auth provider
│   └── splash.tsx            # Splash screen
├── contexts/                 # React Context providers
│   └── AuthContext.tsx       # Authentication context
├── lib/                      # Utilities and API clients
│   ├── ai/                   # AI-related helpers
│   ├── appwrite.ts           # Appwrite client config
│   ├── auth.ts               # Auth API calls
│   ├── gemini.ts             # Google Gemini integration
│   ├── icons.tsx             # SVG icon components
│   ├── jikan.ts              # Jikan (anime) API client
│   ├── tmdb.ts               # TMDB (movie) API client
│   ├── watchlist.ts          # Watchlist CRUD operations
│   └── watchlistEvents.ts    # Watchlist event emitter
├── assets/                   # Images, fonts, and static assets
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables (not committed)
```

---

## How It Works

### AI Recommendation Flow

1. User describes what they want to watch in natural language
2. **Gemini 1.5 Flash** processes the query and returns 5-7 movie titles with reasons
3. CineVerse searches **TMDB** for each title and matches the best results
4. Recommendations are displayed with match percentages, mood tags, and AI reasoning
5. If Gemini is unavailable, a local mood-detection engine provides curated fallback picks

### Authentication Flow

1. User signs up or logs in via email/password or Google OAuth
2. **Appwrite** handles authentication, session management, and user data
3. Auth state is managed globally through `AuthContext`
4. App gracefully degrades to offline mode if the backend is unavailable

---

## Contributing

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Expo](https://expo.dev) — Cross-platform React Native framework
- [TMDB](https://www.themoviedb.org) — Movie and TV show data
- [Jikan](https://jikan.moe) — Unofficial MyAnimeList REST API
- [Google Gemini](https://ai.google.dev) — Generative AI for recommendations
- [Appwrite](https://appwrite.io) — Open-source backend platform
- [NativeWind](https://www.nativewind.dev) — Tailwind CSS for React Native

---

<div align="center">

**[⬆ Back to Top](#cineverse-ai)**

Made with care for movie & anime lovers.

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
