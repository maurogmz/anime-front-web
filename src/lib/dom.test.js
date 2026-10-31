import { describe, it, expect, vi } from "vitest";
import { h } from "./dom.js";

describe("h", () => {
  it("renders children as text, never HTML", () => {
    const el = h("p", {}, "<img src=x onerror=alert(1)>");
    expect(el.children).toHaveLength(0);
    expect(el.textContent).toBe("<img src=x onerror=alert(1)>");
  });

  it("drops javascript: and http: URLs but keeps hash routes", () => {
    expect(h("a", { href: "javascript:alert(1)" }).hasAttribute("href")).toBe(false);
    expect(h("img", { src: "http://x/a.jpg" }).hasAttribute("src")).toBe(false);
    expect(h("a", { href: "#/anime/1" }).getAttribute("href")).toBe("#/anime/1");
  });

  it("only binds function handlers, never inline strings", () => {
    expect(h("div", { onclick: "alert(1)" }).hasAttribute("onclick")).toBe(false);
    const fn = vi.fn();
    h("button", { onClick: fn }).click();
    expect(fn).toHaveBeenCalled();
  });

  it("skips null/false props and children", () => {
    const el = h("button", { disabled: false, hidden: null }, null, false, "ok");
    expect(el.hasAttribute("disabled")).toBe(false);
    expect(el.textContent).toBe("ok");
  });
});
