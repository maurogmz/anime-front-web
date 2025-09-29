import "./main.css";
import { router } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  router(window.location.pathname + window.location.search);

  window.addEventListener("popstate", () => {
    router(window.location.pathname + window.location.search);
  });

});
