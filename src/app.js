import { router } from "./router.js";
import "./styles/global.css";

document.addEventListener("DOMContentLoaded", () => {
  router(window.location.pathname);

  // Manejar navegación con history API
  window.addEventListener("popstate", () => {
    router(window.location.pathname);
  });
});