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

const media = { id: 1, kind: "anime", title: "Cowboy Bebop", image: "https://s4.anilist.co/x.jpg", score: 8.75, year: 1998 };

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

  it("migrates v1 favorites by MAL id and only then drops the legacy key", async () => {
    const v1 = JSON.stringify([
      [20, { mal_id: 20, title: "Naruto" }],
      [5114, { mal_id: 5114 }],
    ]);
    const storage = memoryStorage({ anime_favs_v1: v1 });
    const store = createFavoritesStore(storage);
    const resolve = vi.fn(async () => [{ id: 20, kind: "anime", title: "Naruto", image: "https://s4.anilist.co/n.jpg", score: 80 }]);

    expect(await store.migrateLegacy(resolve)).toBe(1);
    expect(resolve).toHaveBeenCalledWith([20, 5114]);
    expect(store.has("anime", 20)).toBe(true);
    expect(storage.data.anime_favs_v1).toBeUndefined();
  });

  it("keeps v1 favorites when the lookup fails", async () => {
    const storage = memoryStorage({ anime_favs_v1: JSON.stringify([[20, {}]]) });
    const store = createFavoritesStore(storage);
    await expect(store.migrateLegacy(async () => Promise.reject(new Error("down")))).rejects.toThrow("down");
    expect(storage.data.anime_favs_v1).toBeDefined();
  });
});
