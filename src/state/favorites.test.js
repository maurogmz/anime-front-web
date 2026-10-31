import { describe, it, expect, vi } from "vitest";
import { createFavoritesStore } from "./favorites.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => (data[k] = String(v)),
    removeItem: (k) => delete data[k],
  };
}

const media = { id: 1, kind: "anime", title: "Cowboy Bebop", image: "https://cdn.myanimelist.net/x.jpg", score: 8.75, year: 1998 };

describe("favorites store", () => {
  it("toggles, notifies and persists", () => {
    const storage = memoryStorage();
    const store = createFavoritesStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);

    expect(store.toggle(media)).toBe(true);
    expect(store.has("anime", 1)).toBe(true);
    expect(store.has("manga", 1)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(createFavoritesStore(storage).size).toBe(1);

    expect(store.toggle(media)).toBe(false);
    expect(store.size).toBe(0);
  });

  it("rejects tampered entries and unsafe image URLs", () => {
    const tampered = [
      media,
      { id: "1; drop", kind: "anime", title: "x" },
      { id: 2, kind: "evil", title: "y" },
      { ...media, id: 3, image: "javascript:alert(1)" },
    ];
    const store = createFavoritesStore(memoryStorage({ "animehub:favorites:v2": JSON.stringify(tampered) }));
    expect(store.list().map((f) => f.id)).toEqual([3, 1]);
    expect(store.list()[0].image).toBe("");
  });

  it("survives corrupt JSON", () => {
    expect(createFavoritesStore(memoryStorage({ "animehub:favorites:v2": "{oops" })).size).toBe(0);
  });

  it("migrates v1 favorites", () => {
    const v1 = JSON.stringify([
      [20, { mal_id: 20, title: "Naruto", images: { jpg: { large_image_url: "https://cdn.myanimelist.net/n.jpg" } }, score: 8 }],
    ]);
    const storage = memoryStorage({ anime_favs_v1: v1 });
    const store = createFavoritesStore(storage);
    expect(store.has("anime", 20)).toBe(true);
    expect(storage.data.anime_favs_v1).toBeUndefined();
    expect(storage.data["animehub:favorites:v2"]).toContain("Naruto");
  });
});
