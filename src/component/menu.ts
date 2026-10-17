import Papiro from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";
import { IndexItem, ItemType } from "../model/index.item.js";
import { pageName } from "./names.js";

/**
 * The pages of the wiki, following its folders.
 * On phones it is a drawer over the page.
 */
export default class Menu {
	readonly element: HTMLElement;
	private readonly links = new Map<string, HTMLElement>();

	constructor(papiro: Papiro) {
		this.element = uiComponent({ type: "nav", classes: ["papiro-menu"] });

		if ("" != papiro.options.title) {
			this.element.appendChild(
				uiComponent({ type: "p", classes: ["papiro-menu-title"], text: papiro.options.title }),
			);
		}

		const list = uiComponent({ classes: ["papiro-menu-list"] });
		this.element.appendChild(list);
		for (const key in papiro.data.index.files)
			list.appendChild(this.option(papiro, key, papiro.data.index.files[key], 0));
	}

	private option(papiro: Papiro, route: string, item: IndexItem, level: number): HTMLElement {
		const name = pageName(route);

		if (ItemType.File == item.type) {
			const link = papiro.link({ view: "page", route: route.toLowerCase() }, name, ["papiro-menu-link"]);
			link.style.paddingLeft = `${0.75 + level}rem`;
			this.links.set(route.toLowerCase(), link);
			return link;
		}

		const folder = uiComponent({ classes: ["papiro-menu-folder"] });
		const toggle = uiComponent({
			type: "button",
			classes: ["papiro-menu-link"],
			text: `<span>${name}</span>${icon("expand", 18)}`,
			attributes: { "aria-expanded": "true" },
		});
		toggle.style.paddingLeft = `${0.75 + level}rem`;
		toggle.onclick = () => {
			const closed = folder.classList.toggle("closed");
			toggle.setAttribute("aria-expanded", closed ? "false" : "true");
		};
		folder.appendChild(toggle);

		const children = uiComponent({ classes: ["papiro-menu-children"] });
		for (const key in item.files)
			children.appendChild(this.option(papiro, `${route}/${key}`, item.files[key], level + 1));
		folder.appendChild(children);
		return folder;
	}

	/** Mark the page being read */
	select(route: string | null) {
		this.links.forEach((link, linkRoute) => link.classList.toggle("selected", linkRoute == route));
	}

	toggle() {
		this.element.classList.toggle("open");
	}

	close() {
		this.element.classList.remove("open");
	}
}
