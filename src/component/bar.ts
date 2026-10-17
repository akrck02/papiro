import Papiro, { THEME_EVENT } from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";

/**
 * Top bar: the wiki name, the search and the buttons for the
 * graph, the font, the theme and, on phones, the menu
 */
export default class Bar {
	static create(papiro: Papiro): HTMLElement {
		const options = papiro.options;
		const bar = uiComponent({ type: "header", classes: ["papiro-bar"] });

		const logo = "" != options.logo ? `<img class="papiro-logo" src="${options.logo}" alt="">` : "";
		const home = options.startPage ? { view: "home" as const } : { view: "page" as const, route: "" };
		bar.appendChild(papiro.link(home, `${logo}<span>${options.title}</span>`, ["papiro-title"]));

		if (options.search) {
			const trigger = uiComponent({
				type: "button",
				classes: ["papiro-search-trigger"],
				text: `${icon("search", 18)}<span>Search the docs…</span><kbd>Ctrl K</kbd>`,
			});
			trigger.onclick = () => papiro.openSearch();
			bar.appendChild(trigger);
		}

		const buttons = uiComponent({ classes: ["papiro-bar-buttons"] });
		bar.appendChild(buttons);

		if (options.graph) {
			const graph = papiro.link({ view: "graph" }, icon("hub"), ["papiro-bar-button"]);
			graph.title = "Graph";
			buttons.appendChild(graph);
		}

		const font = Bar.button(icon("text_fields"), "Switch font", () => papiro.toggleFont());
		buttons.appendChild(font);

		const theme = Bar.button("", "Switch theme", () => papiro.toggleTheme());
		const updateTheme = () => {
			theme.innerHTML = icon(papiro.isDark() ? "light_mode" : "dark_mode");
		};
		updateTheme();
		papiro.root.addEventListener(THEME_EVENT, updateTheme);
		buttons.appendChild(theme);

		if (options.menu) {
			const menu = Bar.button(icon("menu_open"), "Menu", () => papiro.toggleMenu());
			menu.classList.add("papiro-narrow-only");
			buttons.appendChild(menu);
		}

		if (options.search) {
			const search = Bar.button(icon("search"), "Search", () => papiro.openSearch());
			search.classList.add("papiro-narrow-only");
			buttons.appendChild(search);
		}

		return bar;
	}

	private static button(html: string, title: string, action: () => void): HTMLElement {
		const button = uiComponent({
			type: "button",
			classes: ["papiro-bar-button"],
			text: html,
			attributes: { title: title, "aria-label": title },
		});
		button.onclick = action;
		return button;
	}
}
