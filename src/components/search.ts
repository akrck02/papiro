import { BubbleUI } from "../lib/bubble.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import Shortcuts from "../lib/shortcut.js";
import { IndexItem, ItemType } from "../model/index.item.js";
import PathService from "../services/path.service.js";
import StringService from "../services/string.service.js";
import WikiService from "../services/wiki.service.js";

type Link = {
  name: string;
  path: string;
};

export default class Search {
  static readonly ID = "search-modal";
  static readonly SEARCHBAR_ID = "searchbar";
  static readonly RESULTS_ID = "results";

  static instance: HTMLElement;
  static searchBar: HTMLInputElement;
  static resultContainer: HTMLElement;
  static results: HTMLElement[] = [];

  static selectionIndex = 0;

  static create(): HTMLElement {
    if (null != this.instance) return this.instance;

    this.instance = uiComponent({
      id: this.ID,
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter, "hidden"],
    });

    this.searchBar = uiComponent({
      type: Html.Input,
      id: this.SEARCHBAR_ID,
      attributes: {
        placeholder: "Search here...",
      },
    }) as HTMLInputElement;

    const separator = uiComponent({ type: Html.Hr });

    this.resultContainer = uiComponent({
      id: this.RESULTS_ID,
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
    });

    Shortcuts.set({
      key: "f",
      shiftKey: true,
      callback: () => Search.toggle(),
    });

    setDomEvents(this.searchBar, {
      keyup: (e: KeyboardEvent) => {
        if (e.key?.toUpperCase() == "ESCAPE") {
          Search.toggle();
          return;
        }

        if (e.key?.toUpperCase() == "ARROWDOWN") {
          this.results[this.selectionIndex].focus();
          return;
        }

        this.search(this.searchBar.value);
      },
    });

    this.instance.appendChild(this.searchBar);
    this.instance.appendChild(separator);
    this.instance.appendChild(this.resultContainer);

    return this.instance;
  }

  private static search(query: string) {
    const links: Link[] = [];
    this.results = [];
    this.selectionIndex = 0;

    for (const itemName in WikiService.index.files) {
      this.searchLinks(
        links,
        query,
        itemName,
        itemName,
        WikiService.index.files[itemName],
      );
    }

    this.resultContainer.innerHTML = "";

    if (0 == links.length) {
      this.resultContainer.appendChild(
        uiComponent({
          type: Html.P,
          text: "No elements.",
        }),
      );

      return;
    }

    for (const i in links) {
      const link = links[i];
      const selectable = uiComponent({
        type: Html.A,
        text: link.name,
        attributes: {
          href: PathService.getWikiViewRoute(link.path),
        },
      });

      setDomEvents(selectable, {
        keyup: (e: KeyboardEvent) => {
          e.preventDefault();
          const key = e.key?.toUpperCase();

          if (key == "ESCAPE") {
            Search.toggle();
            return;
          }

          if (key == "ENTER") {
            Search.toggle();
            return;
          }

          if (key == "ARROWDOWN") {
            this.selectionIndex++;
            if (this.selectionIndex == this.results.length) {
              this.selectionIndex = 0;
            }

            this.results[this.selectionIndex].focus();
            return;
          } else if (key == "ARROWUP") {
            this.selectionIndex--;
            if (this.selectionIndex < 0) {
              this.searchBar.focus();
            }

            this.results[this.selectionIndex].focus();
            return;
          }
        },
      });

      this.results.push(selectable);
      this.resultContainer.appendChild(selectable);
    }
  }

  private static searchLinks(
    links: Link[],
    query: string,
    name: string,
    route: string,
    item: IndexItem,
  ) {
    // if no valid params, return
    if (
      undefined == query ||
      undefined == name ||
      undefined == item ||
      undefined == links
    )
      return;

    // if it is a file, return
    if (ItemType.File == item.type) {
      // if the query does not match, do no add to search results
      if (false == this.queryMatches(name, query)) return;

      // add file to search results
      links.push({
        name: PathService.getPascalCase(PathService.decodeCustomUrl(name)),
        path: `${route}`,
      });

      return;
    } else {
      // if the query matches add file to search results
      if (true == this.queryMatches(name, query)) {
        links.push({
          name: PathService.getPascalCase(PathService.decodeCustomUrl(name)),
          path: `${route}`,
        });
      }

      // if it is a directory, search for the matching contents inside
      for (const childName in item.files) {
        this.searchLinks(
          links,
          query,
          childName,
          `${route}/${childName}`,
          item.files[childName],
        );
      }
    }
  }

  private static queryMatches(value: string, query: string) {
    console.debug(value, query);
    return StringService.containsMatching(value, query);
  }

  static toggle() {
    if (null == this.instance) return;

    this.instance.classList.toggle("hidden");
    this.searchBar.value = "";
    this.searchBar.focus();
  }
}
