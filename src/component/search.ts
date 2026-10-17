import Papiro from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";
import StringService from "../service/string.service.js";
import { pageName } from "./names.js";

/**
 * Search palette: pages by name, arrows to move, Enter to open, Esc to close
 */
export default class Search {
	readonly element: HTMLElement;
	private readonly input: HTMLInputElement;
	private readonly results: HTMLElement;
	private items: { route: string; link: HTMLAnchorElement }[] = [];
	private selected = 0;

	constructor(private readonly papiro: Papiro) {
		this.element = uiComponent({ classes: ["papiro-search", "hidden"] });
		const palette = uiComponent({
			classes: ["papiro-search-palette"],
			attributes: { role: "dialog", "aria-label": "Search" },
		});
		this.element.appendChild(palette);

		const toolbar = uiComponent({ classes: ["papiro-search-toolbar"] });
		this.input = uiComponent({
			type: "input",
			attributes: { placeholder: "Search pages…", "aria-label": "Search pages" },
		}) as HTMLInputElement;
		toolbar.appendChild(this.input);

		const close = uiComponent({
			type: "button",
			text: icon("exit_to_app"),
			attributes: { "aria-label": "Close" },
		});
		close.onclick = () => this.close();
		toolbar.appendChild(close);
		palette.appendChild(toolbar);

		this.results = uiComponent({ classes: ["papiro-search-results"] });
		palette.appendChild(this.results);
		palette.appendChild(
			uiComponent({
				classes: ["papiro-search-hints"],
				text: "<span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span>",
			}),
		);

		this.input.addEventListener("input", () => this.search(this.input.value));
		this.input.addEventListener("keydown", (event) => this.onKey(event));

		// a click outside the palette closes it
		this.element.addEventListener("mousedown", (event) => {
			if (event.target == this.element) this.close();
		});
	}

	open() {
		this.element.classList.remove("hidden");
		this.input.value = "";
		this.search("");
		this.input.focus();
	}

	close() {
		this.element.classList.add("hidden");
	}

	toggle() {
		if (this.element.classList.contains("hidden")) this.open();
		else this.close();
	}

	private onKey(event: KeyboardEvent) {
		switch (event.key) {
			case "ArrowDown":
			case "ArrowUp":
				event.preventDefault();
				if (0 == this.items.length) return;
				const step = "ArrowDown" == event.key ? 1 : -1;
				this.select((this.selected + step + this.items.length) % this.items.length);
				break;
			case "Enter":
				event.preventDefault();
				this.items[this.selected]?.link.click();
				break;
			case "Escape":
				event.preventDefault();
				this.close();
				break;
		}
	}

	private search(query: string) {
		this.results.replaceChildren();
		this.items = [];

		const routes = this.papiro.data.routes.filter(
			(route) => "" == query.trim() || StringService.search(pageName(route), query),
		);

		if (0 == routes.length) {
			this.results.appendChild(
				uiComponent({
					type: "p",
					text: `No results for “${StringService.escape(query)}”.`,
				}),
			);
			return;
		}

		for (const route of routes) {
			const folders = route.split("/").slice(0, -1).map(pageName).join(" / ") || "Home";
			const link = this.papiro.link(
				{ view: "page", route: route },
				`<b>${pageName(route)}</b><span>${folders}</span>`,
			);
			link.addEventListener("mouseenter", () => this.select(this.items.findIndex((i) => i.link == link)));
			link.addEventListener("click", () => this.close());
			this.items.push({ route, link });
			this.results.appendChild(link);
		}

		this.select(0);
	}

	/** one selection, shared by the keyboard and the mouse */
	private select(index: number) {
		this.selected = index;
		this.items.forEach((item, i) => item.link.classList.toggle("selected", i == index));
		this.items[index]?.link.scrollIntoView({ block: "nearest" });
	}
}
