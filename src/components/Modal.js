import { createElement } from "../utils/helpers.js";

export function Modal({ title = "", contentEl, onClose }) {
  const overlay = createElement("div",{class:"modal"});
  const card = createElement("div",{class:"modal-card"});
  const header = createElement("div",{class:"row"}, [ createElement("h3", {}, [title]) ]);
  const closeBtn = createElement("button",{class:"pill"}, ["Cerrar"]);
  closeBtn.style.marginLeft = "auto";
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    onClose?.();
  });
  header.append(closeBtn);
  card.append(header, contentEl);
  overlay.append(card);
  document.body.appendChild(overlay);
  return overlay;
}
