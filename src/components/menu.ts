import { BubbleUI } from "../lib/bubble.js";
import { setDomAttributes, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { Index, IndexItem, ItemType } from "../model/index.item.js";
import PathService from "../services/path.service.js";

export default class IndexMenu {
	static readonly ID = "index-menu";
	static readonly SEARCHBAR_ID = "searchbar";
	static readonly INDEX_LINK_ID = "index-link";

	static create(index: Index): HTMLElement {
		// menu
		const menu = uiComponent({
			type: Html.Div,
			id: IndexMenu.ID,
		});

		// search bar
		const searchBar = uiComponent({
			type: Html.Input,
			id: IndexMenu.SEARCHBAR_ID,
			attributes: {
				placeholder: "Search...",
			},
		});
		menu.appendChild(searchBar);

		// options
		const options = uiComponent({
			type: Html.Div,
			classes: [BubbleUI.BoxColumn],
		});
		menu.appendChild(options);

		// create index options
		for (const key in index) {
			options.appendChild(
				this.createOption(
					PathService.getWikiViewRoute(key),
					key,
					index[key],
					options,
				),
			);
		}

		return menu;
	}

	private static createOption(
		route: string,
		key: string,
		value: IndexItem,
		parent: HTMLElement,
		level: number = 0,
	): HTMLElement {
		switch (value.type) {
			case ItemType.Directory:
				const item = this.indexLink(null, key, level);
				const container = uiComponent({
					classes: [BubbleUI.BoxColumn],
				});

				container.appendChild(item);
				for (const key in value.files) {
					container.appendChild(
						this.createOption(
							`${route}/${key}`.toLocaleLowerCase(),
							key,
							value.files[key],
							container,
							level + 1,
						),
					);
				}

				return container;
			case ItemType.File:
				return this.indexLink(route, key, level);
		}
	}

	private static indexLink(
		route: string,
		name: string,
		level: number,
	): HTMLElement {
		const isDirectory = null == route;

		name = PathService.getPascalCase(name);
		const text = isDirectory
			? `${IndexMenu.getIndexLinkIcon("expand").outerHTML} &nbsp;${name}`
			: `${IndexMenu.getIndexLinkIcon("tag").outerHTML} &nbsp;${name}`;

		const item = uiComponent({
			type: Html.A,
			id: IndexMenu.INDEX_LINK_ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxYCenter, "hover-primary"],
			text: text,
			styles: { paddingLeft: `${1 + level}rem` },
			selectable: false,
		});

		if (null != route) {
			setDomAttributes(item, { href: PathService.getRoute(route) });
		}

		return item;
	}

	private static getIndexLinkIcon(icon: string): HTMLElement {
		return getIcon("material", icon, "1rem", "var(--on-surface-1)");
	}
}
