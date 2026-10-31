import { describe, it, expect } from "vitest";
import { toMedia, htmlToText, uniqueById } from "./mappers.js";

const raw = {
  id: 154587,
  type: "ANIME",
  title: { romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End", native: "葬送のフリーレン" },
  coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587.jpg", color: "#d6e4a1" },
  bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587.jpg",
  format: "TV",
  status: "FINISHED",
  averageScore: 91,
  episodes: 28,
  duration: 24,
  seasonYear: 2023,
  startDate: { year: 2023, month: 9, day: 29 },
  endDate: { year: 2024, month: 3, day: 22 },
  description: "<i>Frieren</i> is an elf.<br><br>\nShe outlives&nbsp;her party. <script>alert(1)</script>(Source: Crunchyroll)",
  genres: ["Adventure", "Drama", "Fantasy"],
  rankings: [
    { rank: 1, type: "RATED", allTime: true },
    { rank: 3, type: "RATED", allTime: false },
    { rank: 40, type: "POPULAR", allTime: true },
  ],
  trailer: { id: "qgQkeKz7YOw", site: "youtube" },
  studios: { nodes: [{ name: "Madhouse" }] },
  siteUrl: "https://anilist.co/anime/154587",
  recommendations: {
    nodes: [{ mediaRecommendation: { id: 1, type: "ANIME", title: { romaji: "Mushishi" } } }, { mediaRecommendation: null }],
  },
};

describe("toMedia", () => {
  it("maps AniList fields to the app shape", () => {
    const m = toMedia(raw);
    expect(m).toMatchObject({
      id: 154587,
      kind: "anime",
      title: "Frieren: Beyond Journey's End",
      altTitle: "Sousou no Frieren",
      titleNative: "葬送のフリーレン",
      format: "TV",
      status: "Finished",
      score: 91,
      rank: 1,
      popularityRank: 40,
      year: 2023,
      duration: "24 min per ep",
      period: "Sep 29, 2023 to Mar 22, 2024",
      creators: ["Madhouse"],
      trailerUrl: "https://www.youtube.com/watch?v=qgQkeKz7YOw",
      color: "#d6e4a1",
    });
    expect(m.recommendations.map((r) => r.title)).toEqual(["Mushishi"]);
  });

  it("drops unsafe URLs and bad trailer ids", () => {
    const m = toMedia({
      ...raw,
      coverImage: { extraLarge: "javascript:alert(1)" },
      bannerImage: "http://x/b.jpg",
      trailer: { id: "x/../evil", site: "youtube" },
    });
    expect(m.image).toBe("");
    expect(m.banner).toBe("");
    expect(m.trailerUrl).toBe("");
  });

  it("keeps only creative staff as manga authors", () => {
    const m = toMedia({
      id: 30002,
      type: "MANGA",
      title: { romaji: "Berserk" },
      status: "RELEASING",
      staff: {
        edges: [
          { role: "Story & Art (vols 1-41)", node: { name: { full: "Kentarou Miura" } } },
          { role: "Translator (Portuguese)", node: { name: { full: "Someone" } } },
        ],
      },
    });
    expect(m.kind).toBe("manga");
    expect(m.status).toBe("Publishing");
    expect(m.creators).toEqual(["Kentarou Miura"]);
    expect(m.score).toBeNull();
  });
});

describe("htmlToText", () => {
  it("keeps text, paragraph breaks and entities; drops tags and source credit", () => {
    expect(htmlToText(raw.description)).toBe("Frieren is an elf.\n\nShe outlives her party. alert(1)");
  });
  it("handles empty input", () => {
    expect(htmlToText(null)).toBe("");
  });
});

describe("uniqueById", () => {
  it("removes duplicates and invalid ids", () => {
    expect(uniqueById([{ id: 1 }, { id: 1 }, { id: 2 }, { id: undefined }]).map((x) => x.id)).toEqual([1, 2]);
  });
});
