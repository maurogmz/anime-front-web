
# 🎌 Anime Hub v2.0

<div align="center">

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Jikan API](https://img.shields.io/badge/API-Jikan%20v4-ff69b4?style=for-the-badge&logo=graphql&logoColor=white)

[![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen?style=flat-square)](https://github.com/maurogmz/anime-front-web)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/maurogmz/anime-front-web?style=flat-square&color=yellow)](https://github.com/maurogmz/anime-front-web/stargazers)
[![Forks](https://img.shields.io/github/forks/maurogmz/anime-front-web?style=flat-square&color=orange)](https://github.com/maurogmz/anime-front-web/network)

</div>

Browse and search **anime and manga** with data from the [Jikan API v4](https://docs.api.jikan.moe/) (unofficial MyAnimeList API).

**Live site:** https://maurogmz.github.io/anime-front-web/

---

## ✨ Features
- 📺 **Home**: featured top-rated show of the season, plus rails for airing anime, top anime and top manga.
- 🔎 **Browse** anime or manga by title, with format, status, genre and sort filters. Filters live in the URL, so results can be shared and the back button works.
- 📄 **Detail page**: score, rank, popularity, synopsis, genres, studios/authors, trailer and recommendations.
- ❤️ **Favorites**, saved in the browser (localStorage).
- ♿ Keyboard and screen-reader friendly: skip link, focus management, labelled controls, reduced-motion support.

---

## 🛠️ Tech Stack
- **Vanilla JavaScript (ES modules)**, no framework, built with **Vite**.
- **Vitest + jsdom** for unit tests.
- Self-hosted variable fonts (Fraunces, Instrument Sans) via Fontsource.
- Deployed to **GitHub Pages** with `gh-pages`.

---

## 🗂️ Project Structure
```
src/
├── main.js              # Entry: app shell + router wiring
├── app/router.js        # Hash router (works on GitHub Pages without 404s)
├── api/
│   ├── httpClient.js    # Rate limiting, retries, cache, request dedup
│   ├── jikan.js         # Facade: the only module that knows Jikan endpoints
│   └── mappers.js       # Adapter: raw API JSON → app Media model
├── config/catalog.js    # Filter options + URL param whitelisting
├── state/favorites.js   # Observer store persisted in localStorage
├── lib/                 # dom (safe element factory), icons, format, url
├── components/          # Header, MediaCard, MediaRail, FilterBar, Pagination, StatusView…
├── pages/               # Home, Browse, Detail, Favorites, NotFound
└── styles/              # tokens → base → components → pages
```

**Design patterns:** Facade (`jikan.js`), Adapter (`mappers.js`), Observer (`favorites.js`), Factory (component functions, `createHttpClient`), Proxy-style cache in front of `fetch`.

---

## 🔌 Working with the Jikan API
Jikan allows **3 requests/second and 60/minute**. The client (`src/api/httpClient.js`):
- throttles requests client-side (one every 400 ms, max 55/min);
- retries `429` and `5xx` with exponential backoff and honors `Retry-After`;
- fails fast on timeouts (Jikan has outages) and shows a retry button;
- caches responses in memory and `sessionStorage` (10 min for searches, 1 h for details/top, 24 h for genres);
- deduplicates identical in-flight requests.

Searches always send `sfw=true` and `limit=24` (the API max is 25).

---

## 🔒 Security
- No `innerHTML` with data: every node is built with `document.createElement` and text nodes.
- Every API and localStorage URL is validated (`https:` only) before it reaches `src`/`href`.
- URL query params are whitelisted before they reach the API.
- Stored favorites are re-validated on load.
- A Content-Security-Policy `<meta>` tag is injected at build time. It allows only this site's own scripts, styles and fonts, Jikan for requests, and the MyAnimeList CDN for images.
- External links use `rel="noopener noreferrer"`.

---

## 🚀 Getting Started
```bash
npm install
npm run dev       # http://localhost:5173/anime-front-web/
npm test          # unit tests
npm run build     # production build in dist/
npm run deploy    # tests + build + publish dist/ to the gh-pages branch
```

---

## 🌿 Git Workflow (git flow)
- `master`: production releases (tagged, deployed to GitHub Pages).
- `develop`: integration branch.
- `feature/*` → `develop`, `release/x.y.z` → `master` + `develop`, `hotfix/*` → `master` + `develop`.

---

## 📝 Version
- **v2.0.0**: redesign, manga support, filters, favorites, resilient Jikan client, security hardening, tests.
- **v1.0**: initial prototype with basic search.

---

## 📜 License
This project is open for **learning and experimentation**.
Feel free to use, modify, and improve it.

---
## 📞 Contact & Support

<div align="center">

**Developed with ❤️ by [Mauro Gómez](https://github.com/maurogmz)**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/maurogmz)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/maurogmz)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/maurogomez_mfg)


*If you found this project helpful, please consider giving it a ⭐*

</div>
