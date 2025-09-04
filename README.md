
# ?? Anime & Manga Explorer v1.0

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Jikan API](https://img.shields.io/badge/API-Jikan%20v4-ff69b4?style=for-the-badge&logo=graphql&logoColor=white)

[![Version](https://img.shields.io/badge/Version-1.0-brightgreen?style=flat-square)](https://github.com/maurogmz/anime-front-web)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/maurogmz/anime-front-web?style=flat-square&color=yellow)](https://github.com/maurogmz/anime-front-web/stargazers)
[![Forks](https://img.shields.io/github/forks/maurogmz/anime-front-web?style=flat-square&color=orange)](https://github.com/maurogmz/anime-front-web/network)

</div>

A simple **prototype project (v1.0)** built with **JavaScript, HTML, and CSS** to test the [Jikan API v4](https://docs.api.jikan.moe/).  
It allows searching for **anime** and **manga** and displays basic details such as images, titles, episodes/volumes, publishing date, and scores.  

?? **Disclaimer:** This is an early prototype ? Many improvements are still pending.  

---

## ? Features
- ?? Search for **anime** and **manga** using the Jikan API.  
- ?? Display results in styled **cards**, including:
  - ?? Official image  
  - ??? Title  
  - ?? Type (TV, Manga, OVA, etc.)  
  - ?? Release date (?)  
  - ? MyAnimeList score (?)  

---


## ??? Tech Stack

<div align="center">

![Tech Stack](https://skillicons.dev/icons?i=html,css,js,git,github&theme=dark)

</div>

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Jikan API v4 (MyAnimeList unofficial API)
- **Styling**: Custom CSS with modern design principles
- **Version Control**: Git & GitHub

---


## ?? API Reference

This project uses the [Jikan API v4](https://docs.api.jikan.moe/), which provides:

- ?? **Anime Data**: Titles, descriptions, ratings, episodes, and more
- ?? **Manga Data**: Chapters, volumes, publication info, and more
- ?? **Character Info**: Voice actors, descriptions, and relationships
- ?? **Studio Info**: Animation studios and producers

### Example API Call
```javascript
// Get anime information
const response = await fetch('https://api.jikan.moe/v4/anime/1');
const data = await response.json();
```

---

## ?? Getting Started
1. Clone or download the repository.  
2. Open `index.html` in your favorite browser (Chrome, Firefox, Edge).  
3. Enter a search term (e.g., `Mob 100`).  
4. Explore anime and manga results instantly. ??  

---

## ?? Roadmap / To-Do
- ?? Enhance UI/UX with a CSS framework (Tailwind / Bootstrap).  
- ?? Add a detailed view for each anime/manga.  
- ?? Implement pagination for results.  
- ?? Better error handling (e.g., empty searches, no results).  
- ??? Store recent searches.  
- ? Future migration to a modern JavaScript framework (React / Vue).  

---

## ?? Version
- **v1.0** ? Initial working prototype with basic search features.  

---

## ?? License
This project is open for **learning and experimentation**.  
Feel free to use, modify, and improve it.  

---
## ?? Contact & Support

<div align="center">

**Developed with ?? by [Mauro Gómez](https://github.com/maurogmz)**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/maurogmz)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/maurogmz)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/maurogomez_mfg)


*If you found this project helpful, please consider giving it a ?!*

</div>

---

### ?? *?The journey has just begun??* ??

<div align="center" style="background-color:lightblue">
	<h1>2020 v1</h1>
	<img src="gif.gif">
</div>





