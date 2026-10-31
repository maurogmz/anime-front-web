import { describe, it, expect } from "vitest";
import { toMedia, toRecommendation, uniqueById } from "./mappers.js";

const raw = {
  mal_id: 5114,
  title: "Hagane no Renkinjutsushi: Fullmetal Alchemist",
  title_english: "Fullmetal Alchemist: Brotherhood",
  title_japanese: "鋼の錬金術師",
  images: {
    webp: { large_image_url: "https://cdn.myanimelist.net/a.webp" },
    jpg: { large_image_url: "https://cdn.myanimelist.net/a.jpg" },
  },
  type: "TV",
  score: 9.1,
  episodes: 64,
  aired: { from: "2009-04-05T00:00:00+00:00", string: "Apr 5, 2009 to Jul 4, 2010" },
  synopsis: "Two brothers.\n\n[Written by MAL Rewrite]",
  genres: [{ mal_id: 1, name: "Action" }],
  themes: [{ mal_id: 38, name: "Military" }],
  studios: [{ mal_id: 4, name: "Bones" }],
  trailer: { url: "javascript:alert(1)" },
  url: "https://myanimelist.net/anime/5114",
};

describe("toMedia", () => {
  it("maps anime fields to the app shape", () => {
    const m = toMedia(raw, "anime");
    expect(m).toMatchObject({
      id: 5114,
      kind: "anime",
      title: "Fullmetal Alchemist: Brotherhood",
      altTitle: "Hagane no Renkinjutsushi: Fullmetal Alchemist",
      image: "https://cdn.myanimelist.net/a.webp",
      year: 2009,
      episodes: 64,
      synopsis: "Two brothers.",
      creators: [{ id: 4, name: "Bones" }],
    });
    expect(m.genres.map((g) => g.name)).toEqual(["Action", "Military"]);
  });

  it("drops unsafe URLs", () => {
    expect(toMedia(raw, "anime").trailerUrl).toBe("");
    expect(toMedia({ ...raw, images: { jpg: { large_image_url: "http://x/a.jpg" } } }, "anime").image).toBe("");
  });

  it("uses authors for manga and survives missing fields", () => {
    const m = toMedia({ mal_id: 2, title: "Berserk", authors: [{ mal_id: 1868, name: "Miura, Kentarou" }] }, "manga");
    expect(m.creators[0].name).toBe("Miura, Kentarou");
    expect(m.score).toBeNull();
    expect(m.genres).toEqual([]);
  });
});

describe("helpers", () => {
  it("toRecommendation reads the nested entry", () => {
    expect(toRecommendation({ entry: { mal_id: 1, title: "X" }, votes: 3 })).toMatchObject({ id: 1, title: "X", votes: 3 });
  });
  it("uniqueById removes duplicates and invalid ids", () => {
    expect(uniqueById([{ id: 1 }, { id: 1 }, { id: 2 }, { id: undefined }]).map((x) => x.id)).toEqual([1, 2]);
  });
});
