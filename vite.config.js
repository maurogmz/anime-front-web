import { defineConfig } from "vite";

// GitHub Pages cannot send HTTP headers, so the CSP ships as a <meta> tag.
// Build-only: the dev server injects inline styles/scripts for HMR.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' https://cdn.myanimelist.net data:",
  "font-src 'self'",
  "connect-src https://api.jikan.moe",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

const contentSecurityPolicy = {
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml: () => [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" }],
};

export default defineConfig({
  base: "/anime-front-web/",
  plugins: [contentSecurityPolicy],
  server: { port: 5173 },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.js"],
  },
});
