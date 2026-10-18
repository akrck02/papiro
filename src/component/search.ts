import Papiro from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";
import StringService from "../service/string.service.js";
import { SearchIndex } from "../core/data.js";
import { pageName } from "./names.js";

type Result = {
	route: string;
	title: string;
	score: number;
	order?: number;
	section?: { id: string; text: string };
	snippet?: string;
};

/** lower case and without accents, to compare text */
function normalise(text: string): string {
	return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** some words around a match, the match marked */
function snippetOf(text: string, at: number, length: number): string {
	const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, at - 50)));
	const end = Math.min(text.length, at + length + 70);
	const before = StringService.escape(text.substring(start, at)).trimStart();
	const match = StringService.escape(text.substring(at, at + length));
	const after = StringService.escape(text.substring(at + length, end));
	return `${0 < start ? "…" : ""}${before}<mark>${match}</mark>${after}${end < text.length ? "…" : ""}`;
}

/**
 * Search palette: pages by name, arrows to move, Enter to open, Esc to close
 */
export default class Search {
	readonly element: HTMLElement;
	private readonly input: HTMLInputElement;
	private readonly results: HTMLElement;
	private items: { route: string; link: HTMLAnchorElement }[] = [];
	private selected = 0;
	private index: SearchIndex | undefined;
	private loading = false;

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
			attributes: { placeholder: "Search the docs…", "aria-label": "Search the docs" },
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
		if (undefined === this.index && !this.loading) {
			this.loading = true;
			this.papiro.data.search().then((index) => {
				this.index = index;
				// search again with what was typed meanwhile
				if (!this.element.classList.contains("hidden")) this.search(this.input.value);
			});
		}
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

		const results = "" == query.trim() ? this.allPages() : this.find(query);
		if (0 == results.length) {
			this.results.appendChild(
				uiComponent({ type: "p", text: `No results for “${StringService.escape(query)}”.` }),
			);
			return;
		}

		for (const result of results.slice(0, Search.MAX_RESULTS)) {
			const folders = result.route.split("/").slice(0, -1).map(pageName).join(" / ") || "Home";
			const title = StringService.escape(result.title) + (result.section ? ` <i>› ${StringService.escape(result.section.text)}</i>` : "");
			const snippet = result.snippet ? `<small>${result.snippet}</small>` : "";
			const link = this.papiro.link(
				{ view: "page", route: result.route, section: result.section?.id },
				`<b>${title}</b><span>${folders}</span>${snippet}`,
			);
			link.addEventListener("mouseenter", () => this.select(this.items.findIndex((i) => i.link == link)));
			link.addEventListener("click", () => this.close());
			this.items.push({ route: result.route, link });
			this.results.appendChild(link);
		}

		this.select(0);
	}

	static readonly MAX_RESULTS = 40;

	private allPages(): Result[] {
		return this.papiro.data.routes.map((route) => ({ route, title: this.titleOf(route), score: 0 }));
	}

	/**
	 * Pages whose name, title, sections or text have the query, best first:
	 * the name, then the title, a section, and the text with a snippet
	 */
	private find(query: string): Result[] {
		const needle = normalise(query.trim());
		const results: Result[] = [];

		this.papiro.data.routes.forEach((route, order) => {
			const page = this.index?.[route];
			const title = this.titleOf(route);

			if (StringService.search(pageName(route), query)) {
				results.push({ route, title, score: 400, order });
				return;
			}
			if (normalise(title).includes(needle)) {
				results.push({ route, title, score: 300, order });
				return;
			}

			const sections = (page?.sections ?? []).filter((s) => normalise(s.text).includes(needle)).slice(0, 2);
			sections.forEach((section) => results.push({ route, title, section, score: 200, order }));
			if (0 < sections.length) return;

			const at = page ? normalise(page.text).indexOf(needle) : -1;
			if (-1 != at) results.push({ route, title, score: 100, order, snippet: snippetOf(page.text, at, needle.length) });
		});

		return results.sort((a, b) => b.score - a.score || a.order - b.order);
	}

	private titleOf(route: string): string {
		return this.index?.[route]?.title || pageName(route);
	}

	/** one selection, shared by the keyboard and the mouse */
	private select(index: number) {
		this.selected = index;
		this.items.forEach((item, i) => item.link.classList.toggle("selected", i == index));
		this.items[index]?.link.scrollIntoView({ block: "nearest" });
	}
}
