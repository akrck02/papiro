import Bar from "../component/bar.js";
import Menu from "../component/menu.js";
import Search from "../component/search.js";
import { uiComponent } from "../lib/dom.js";
import GraphView from "../view/graph.view.js";
import HomeView from "../view/home.view.js";
import NotFoundView from "../view/not.found.view.js";
import PageView from "../view/page.view.js";
import { accentFor } from "./colors.js";
import { WikiData } from "./data.js";
import { HashRouter, MemoryRouter, Router } from "./router.js";
import {
	PapiroFont,
	PapiroOptions,
	PapiroTarget,
	PapiroTheme,
	ResolvedOptions,
} from "./types.js";

/** Width of the reading area under which the side column is hidden, as the css */
const SIDE_COLUMN_WIDTH = 960;
export const THEME_EVENT = "papiro-theme";

/**
 * A papiro wiki inside an element of the page.
 * Every instance keeps its own data, address and theme, so several
 * can live in a page and none of them touches the rest of it.
 */
export default class Papiro {
	readonly root: HTMLElement;
	readonly options: ResolvedOptions;
	readonly data: WikiData;
	readonly router: Router;

	private main: HTMLElement;
	private menu: Menu;
	private search: Search;
	private themeMode: PapiroTheme;
	private cleanups: (() => void)[] = [];
	private renderId = 0;

	private constructor(element: HTMLElement, options: PapiroOptions) {
		this.options = Papiro.resolve(options);
		this.data = new WikiData(this.options.source);
		this.router =
			"memory" == this.options.routing
				? new MemoryRouter(Papiro.firstTarget(this.options))
				: new HashRouter(this.options.hashPrefix, Papiro.firstTarget(this.options));

		this.root = uiComponent({ classes: ["papiro"] });
		element.appendChild(this.root);
	}

	/**
	 * Show a wiki inside an element
	 * @param element where the wiki goes, it takes all its space
	 * @param options the folder of the wiki and how to show it
	 */
	static async create(element: HTMLElement, options: PapiroOptions): Promise<Papiro> {
		const papiro = new Papiro(element, options);
		await papiro.start();
		return papiro;
	}

	private static resolve(options: PapiroOptions): ResolvedOptions {
		const layout = options.layout ?? "wiki";
		const wiki = "wiki" == layout;
		return {
			source: options.source,
			layout: layout,
			routing: options.routing ?? (wiki ? "hash" : "memory"),
			hashPrefix: options.hashPrefix ?? "",
			route: options.route ?? "",
			title: options.title ?? "",
			description: options.description ?? "",
			logo: options.logo ?? "",
			theme: options.theme ?? "auto",
			accent: options.accent ?? "",
			font: options.font ?? "system",
			bar: options.bar ?? wiki,
			menu: options.menu ?? wiki,
			search: options.search ?? wiki,
			graph: options.graph ?? wiki,
			startPage: options.startPage ?? false,
			breadcrumb: options.breadcrumb ?? wiki,
			footer: options.footer ?? false,
			shortcuts: options.shortcuts ?? false,
			onNavigate: options.onNavigate,
			onThemeChange: options.onThemeChange,
			onFontChange: options.onFontChange,
		};
	}

	private static firstTarget(options: ResolvedOptions): PapiroTarget {
		if ("graph" == options.layout) return { view: "graph" };
		if ("wiki" == options.layout && options.startPage && "" == options.route)
			return { view: "home" };
		return { view: "page", route: options.route };
	}

	private async start() {
		this.root.dataset.layout = this.options.layout;
		this.setTheme(this.options.theme, false);
		this.setFont(this.options.font, false);

		const shell = uiComponent({ classes: ["papiro-shell"] });
		this.root.appendChild(shell);

		await this.data.load();

		if (this.options.bar) shell.appendChild(Bar.create(this));

		const body = uiComponent({ classes: ["papiro-body"] });
		shell.appendChild(body);

		if (this.options.menu) {
			this.menu = new Menu(this);
			body.appendChild(this.menu.element);
		}

		this.main = uiComponent({ type: "main", classes: ["papiro-main"] });
		body.appendChild(this.main);

		if (this.options.search) {
			this.search = new Search(this);
			this.root.appendChild(this.search.element);
		}

		// links papiro handles itself (memory routing)
		const onClick = (event: MouseEvent) => {
			const link = (event.target as HTMLElement).closest?.("a[data-papiro-target]");
			if (null == link || !this.root.contains(link)) return;
			if (event.ctrlKey || event.metaKey || event.shiftKey || 0 != event.button) return;
			if (!this.router.intercepts) return;
			event.preventDefault();
			this.navigate(JSON.parse(link.getAttribute("data-papiro-target")));
		};
		this.root.addEventListener("click", onClick);

		this.cleanups.push(this.router.listen((target) => this.render(target)));
		if (this.options.shortcuts) this.listenShortcuts();
		this.watchSystemTheme();

		await this.render(this.router.current());
	}

	/** Go to a page ("" is the first one), the graph or the start page */
	navigate(target: PapiroTarget | string) {
		if ("string" == typeof target) target = { view: "page", route: target };

		// the graph layout only tells, the host app decides what to open
		if ("graph" == this.options.layout && "page" == target.view) {
			this.options.onNavigate?.(target);
			return;
		}

		this.router.navigate(target);
	}

	/** The address of a target, for the href of a link */
	href(target: PapiroTarget): string {
		return this.router.href(target);
	}

	/** A link to a target that works with any routing */
	link(target: PapiroTarget, html: string, classes: string[] = []): HTMLAnchorElement {
		return uiComponent({
			type: "a",
			text: html,
			classes: classes,
			attributes: {
				href: this.href(target),
				"data-papiro-target": JSON.stringify(target),
			},
		}) as HTMLAnchorElement;
	}

	/** There is no room for the side column: the reading area is narrow, not the window */
	isNarrow(): boolean {
		return (this.main?.clientWidth ?? this.root.clientWidth) <= SIDE_COLUMN_WIDTH;
	}

	openSearch() {
		this.search?.open();
	}

	toggleMenu() {
		this.menu?.toggle();
	}

	get theme(): PapiroTheme {
		return this.themeMode;
	}

	get font(): PapiroFont {
		return this.root.dataset.font as PapiroFont;
	}

	isDark(): boolean {
		return "dark" == this.root.dataset.theme;
	}

	/** light, dark, or auto to follow the system */
	setTheme(theme: PapiroTheme, notify: boolean = true) {
		this.themeMode = theme;
		const dark =
			"dark" == theme ||
			("auto" == theme && matchMedia("(prefers-color-scheme: dark)").matches);
		this.root.dataset.theme = dark ? "dark" : "light";
		this.applyAccent(dark);
		this.root.dispatchEvent(new CustomEvent(THEME_EVENT));
		if (notify) this.options.onThemeChange?.(theme);
	}

	/** the project's accent, in the variant of the theme */
	private applyAccent(dark: boolean) {
		const colours = "" == this.options.accent ? null : accentFor(this.options.accent, dark);
		if (null == colours) return;
		this.root.style.setProperty("--primary-color", colours.primary);
		this.root.style.setProperty("--primary-soft", colours.soft);
	}

	toggleTheme() {
		this.setTheme(this.isDark() ? "light" : "dark");
	}

	setFont(font: PapiroFont, notify: boolean = true) {
		if ("papiro" == font) Papiro.loadFonts();
		this.root.dataset.font = font;
		if (notify) this.options.onFontChange?.(font);
	}

	toggleFont() {
		this.setFont("system" == this.font ? "papiro" : "system");
	}

	/** papiro's reading fonts, loaded once and only when chosen */
	private static loadFonts() {
		if (null != document.getElementById("papiro-fonts")) return;
		const link = document.createElement("link");
		link.id = "papiro-fonts";
		link.rel = "stylesheet";
		link.href =
			"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap";
		document.head.appendChild(link);
	}

	/** Remove the wiki and everything it listens to */
	destroy() {
		this.cleanups.forEach((cleanup) => cleanup());
		this.cleanups = [];
		this.root.remove();
	}

	private async render(target: PapiroTarget) {
		const id = ++this.renderId;
		this.search?.close();
		this.menu?.close();

		const container = uiComponent({ classes: ["papiro-view"] });
		// without a start page, its address shows the first page
		if ("home" == target.view && !this.options.startPage) target = { view: "page", route: "" };

		switch (target.view) {
			case "home":
				HomeView.show(this, container);
				break;
			case "graph":
				await GraphView.show(this, container);
				break;
			case "page":
				await PageView.show(this, container, target.route);
				break;
			default:
				NotFoundView.show(this, container);
		}

		// a newer navigation already took the place
		if (id != this.renderId) return;
		this.main.replaceChildren(container);
		this.main.scrollTop = 0;
		this.menu?.select("page" == target.view ? this.data.entry(target.route)?.route : null);
		this.options.onNavigate?.(target);
	}

	private listenShortcuts() {
		const onKey = (event: KeyboardEvent) => {
			const typing = (event.target as HTMLElement).closest?.("input, textarea, [contenteditable]");
			if ((event.ctrlKey || event.metaKey) && "k" == event.key.toLowerCase() && this.search) {
				event.preventDefault();
				this.search.toggle();
			} else if (event.shiftKey && "T" == event.key && !typing) {
				this.toggleTheme();
			}
		};
		document.addEventListener("keydown", onKey);
		this.cleanups.push(() => document.removeEventListener("keydown", onKey));
	}

	private watchSystemTheme() {
		const media = matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			if ("auto" == this.themeMode) this.setTheme("auto", false);
		};
		media.addEventListener("change", onChange);
		this.cleanups.push(() => media.removeEventListener("change", onChange));
	}
}
