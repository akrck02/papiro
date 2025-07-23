import { BubbleUI } from "../lib/bubble.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";

export default class Search {
  static readonly ID = "search-modal";
  static readonly SEARCHBAR_ID = "searchbar";

  static instance: HTMLElement;
  static searchBar: HTMLInputElement;
  static results: HTMLElement;

  static create(): HTMLElement {
    if (null != this.instance) return this.instance;

    this.instance = uiComponent({
      id: this.ID,
      classes: [BubbleUI.BoxColumn, "hidden"],
    });

    this.searchBar = uiComponent({
      type: Html.Input,
      id: this.SEARCHBAR_ID,
      attributes: {
        placeholder: "Search here...",
      },
    }) as HTMLInputElement;

    this.results = uiComponent({});

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      // We detect if the user has pressed the key and keeps holding it down
      if (e.repeat) {
        return;
      }

      if (e.altKey && e.key === "f") {
        this.toggle();
      }
    });

    this.instance.appendChild(this.searchBar);

    return this.instance;
  }

  static toggle() {
    if (null == this.instance) return;

    this.instance.classList.toggle("hidden");
    this.searchBar.value = "";
    this.searchBar.focus();
  }
}
