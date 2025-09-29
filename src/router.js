import { HomePage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";

export function router(path) {
  const app = document.getElementById("app");

  switch (true) {
    case path === "/":
      app.innerHTML = "";
      app.appendChild(HomePage());
      break;

    case /^\/anime\/\d+$/.test(path): 
      app.innerHTML = "";
      app.appendChild(DetailPage());
      break;

    default:
      app.innerHTML = "<h1>404 - Página no encontrada</h1>";
  }
}
