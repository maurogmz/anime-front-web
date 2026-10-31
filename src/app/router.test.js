import { describe, it, expect } from "vitest";
import { matchRoute } from "./router.js";

describe("matchRoute", () => {
  it.each([
    ["", "home"],
    ["#/", "home"],
    ["#/favorites", "favorites"],
    ["#/browse/anime?q=x", "browse"],
    ["#/browse/manga", "browse"],
    ["#/anime/5114", "detail"],
    ["#/manga/2", "detail"],
    ["#/browse/movies", "notFound"],
    ["#/anime/abc", "notFound"],
    ["#/anime/1/extra", "notFound"],
    ["#/<img src=x onerror=alert(1)>", "notFound"],
  ])("%s → %s", (hash, name) => {
    expect(matchRoute(hash).name).toBe(name);
  });

  it("parses kind, numeric id and query", () => {
    const r = matchRoute("#/manga/42?ref=home");
    expect(r).toMatchObject({ kind: "manga", id: 42 });
    expect(r.params.get("ref")).toBe("home");
  });
});
