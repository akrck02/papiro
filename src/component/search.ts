import { BubbleUI } from "../lib/bubble.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import Shortcuts, { KeyInteraction } from "../lib/shortcuts.js";
import { IconBundle, MaterialIcons } from "../model/enum/icons.js";
import { IndexItem, ItemType } from "../model/index.item.js";
import PathService from "../service/path.service.js";
import GlobalShortcuts from "../service/shortcut.global.js";
import StringService from "../service/string.service.js";
import WikiService from "../service/wiki.service.js";

type Link = {
	name: string;
	path: string;
};

/**
 * Search modal component, this class is a singleton
 * it will be instanciated when the first call to "create"
 * is executed, the following calls will inmediately return
 * the current instance.
 */
export default class Search {
	static readonly ID = "search-modal";
	static readonly SEARCH_TOOLBAR_ID = "search-toolbar";
	static readonly SEARCHBAR_ID = "searchbar";
	static readonly RESULTS_ID = "results";

	static instance: HTMLElement;
	static searchBar: HTMLInputElement;
	static resultContainer: HTMLElement;
	static results: HTMLAnchorElement[] = [];
	static exitButton: HTMLButtonElement;

	static selectionIndex = 0;

	/**
	 * Create the shortcut component or get current instance if exists
	 * @returns the component
	 */
	static create(): HTMLElement {
		if (null != this.instance) return this.instance;

		this.instance = uiComponent({
			id: this.ID,
			classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter, "hidden"],
		});

		const searchToolbar = uiComponent({
			id: this.SEARCH_TOOLBAR_ID,
			classes: [BubbleUI.BoxCenter],
		});

		this.searchBar = uiComponent({
			type: Html.Input,
			id: this.SEARCHBAR_ID,
			attributes: {
				placeholder: "Search pages…",
			},
		}) as HTMLInputElement;
		searchToolbar.appendChild(this.searchBar);

		this.exitButton = uiComponent({
			type: Html.Button,
			text: getIcon(IconBundle.Material, MaterialIcons.ExitToApp, "", "")
				.outerHTML,
		}) as HTMLButtonElement;
		this.exitButton.onclick = () => Search.exit();
		const exitButtonShortcutUuid = Shortcuts.register(this.exitButton);
		Shortcuts.set(exitButtonShortcutUuid, {
			key: "ARROWLEFT",
			interaction: KeyInteraction.keyUp,
			callback: () => Search.searchBar.focus(),
		});

		searchToolbar.appendChild(this.exitButton);

		this.instance.appendChild(searchToolbar);

		const separator = uiComponent({ type: Html.Hr });
		this.instance.appendChild(separator);

		this.resultContainer = uiComponent({
			id: this.RESULTS_ID,
			classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
		});
		this.instance.appendChild(this.resultContainer);

		// one selection: the keyboard focus, or the result under the mouse
		this.resultContainer.addEventListener("focusin", (e) =>
			Search.select(e.target as HTMLAnchorElement),
		);

		const hints = uiComponent({
			id: "search-hints",
			classes: [BubbleUI.BoxRow, BubbleUI.BoxYCenter],
			text: "<span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span>",
		});
		this.instance.appendChild(hints);

		// close when clicking outside
		document.addEventListener("mousedown", (e) => {
			if (this.instance.classList.contains("hidden")) return;
			if (!this.instance.contains(e.target as Node)) Search.exit();
		});

		this.setSearchShortcuts();
		return this.instance;
	}

	/**
	 * Set search shortcuts
	 */
	private static setSearchShortcuts() {
		document.addEventListener("keydown", (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && "k" == e.key.toLowerCase()) {
				e.preventDefault();
				Search.toggle();
			}
		});

		GlobalShortcuts.set({
			interaction: KeyInteraction.keyUp,
			key: "f",
			shiftKey: true,
			callback: () => Search.toggle(),
			repeatable: false,
			omitEditableContent: true,
		});

		const searchShortcutRegistry = Shortcuts.register(this.instance);
		Shortcuts.set(searchShortcutRegistry, {
			interaction: KeyInteraction.keyUp,
			key: "ESCAPE",
			callback: () => {
				Search.exit();
			},
		});

		setDomEvents(this.searchBar, {
			keyup: (e: KeyboardEvent) => {
				if (e.key?.toUpperCase() == "ARROWUP") {
					Search.selectionIndex = Search.results.length - 1;
					Search.results[Search.selectionIndex]?.focus();
					return;
				}

				if (e.key?.toUpperCase() == "ARROWDOWN") {
					Search.selectionIndex = 0;
					Search.results[Search.selectionIndex]?.focus();
					return;
				}

				Search.search(Search.searchBar.value);
			},
		});
	}

	/**
	 *
	 * @param query
	 * @returns
	 */
	private static search(query: string) {
		const links: Link[] = [];
		this.results = [];
		this.selectionIndex = 0;

		// Get search results
		for (const itemName in WikiService.index.files) {
			this.searchLinks(
				links,
				query,
				itemName,
				itemName,
				WikiService.index.files[itemName],
			);
		}

		// If no elements present, show a message
		this.resultContainer.innerHTML = "";
		if (0 == links.length) {
			this.resultContainer.appendChild(
				uiComponent({
					type: Html.P,
					text: "" == query.trim() ? "Type to search." : `No results for “${StringService.escape(query)}”.`,
				}),
			);

			return;
		}

		for (const i in links) {
			const selectable = this.createSelectableLink(links[i]);
			this.results.push(selectable);
			this.resultContainer.appendChild(selectable);
		}
	}

	/**
	 * Create a selectable link with custom shortcuts
	 * @param link The link data
	 * @returns The html <a> element
	 */
	private static createSelectableLink(link: Link): HTMLAnchorElement {
		const section = link.path.split("/").slice(0, -1);
		const location = section.length
			? section
					.map((name) =>
						PathService.getPascalCase(PathService.decodeCustomUrl(name)),
					)
					.join(" / ")
			: "Home";

		const selectable = uiComponent({
			type: Html.A,
			text: `<b>${link.name}</b><span>${location}</span>`,
			attributes: {
				href: PathService.getWikiViewRoute(link.path),
			},
		});

		selectable.addEventListener("mouseenter", () => {
			Search.selectionIndex = Search.results.indexOf(
				selectable as HTMLAnchorElement,
			);
			Search.select(selectable as HTMLAnchorElement);
		});

		selectable.onclick = () => {
			Search.selectionIndex = 0;
			Search.exit();
		};

		const uuid = Shortcuts.register(selectable);
		Shortcuts.set(uuid, {
			key: "ESCAPE",
			interaction: KeyInteraction.keyUp,
			callback: () => {
				Search.selectionIndex = 0;
				Search.exit();
			},
		});

		Shortcuts.set(uuid, {
			key: "ARROWUP",
			interaction: KeyInteraction.keyUp,
			callback: () => {
				Search.selectionIndex--;
				if (Search.selectionIndex < 0) {
					Search.searchBar.focus();
					this.selectionIndex = 0;
					return;
				}
				Search.results[Search.selectionIndex].focus();
			},
		});

		Shortcuts.set(uuid, {
			key: "ARROWDOWN",
			interaction: KeyInteraction.keyUp,
			callback: () => {
				Search.selectionIndex++;
				if (Search.selectionIndex == Search.results.length) {
					Search.selectionIndex = 0;
					Search.searchBar.focus();
					return;
				}

				Search.results[Search.selectionIndex].focus();
			},
		});

		return selectable as HTMLAnchorElement;
	}

	/**
	 * Search links for the given query
	 * @param links The link list to fill
	 * @param query The query to match
	 * @param name The link name
	 * @param route The link route
	 * @param item The index item matching the route
	 */
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

			if (
				item.path.endsWith(".html") &&
				true == this.queryMatches(name, query)
			) {
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

	/**
	 * Get if the given value matches the query
	 * @param value The value to inspect
	 * @param query The query to match
	 * @returns if the given value matches the query
	 */
	private static queryMatches(value: string, query: string): boolean {
		return StringService.search(value, query);
	}

	/**
	 * Mark a result as the selected one
	 */
	private static select(result: HTMLAnchorElement) {
		for (const item of this.results)
			item.classList.toggle("selected", item == result);
	}

	/**
	 * Toggle the search modal
	 */
	static toggle() {
		if (null == this.instance) return;
		if (this.instance.classList.contains("hidden")) this.open();
		else this.exit();
	}

	/**
	 * Open the search modal
	 */
	static open() {
		if (null == this.instance) return;
		this.instance.classList.remove("hidden");
		this.search("");
		this.searchBar.focus();
	}

	/**
	 * exit the search modal
	 */
	static exit() {
		if (null == this.instance) return;
		this.instance.classList.add("hidden");
		this.searchBar.value = "";
	}
}
