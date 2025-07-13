import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomAttributes, setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, emitSignal, setSignal } from "../lib/signals.js";
import { AppConfigurations } from "../model/enum/configurations.js";
import { IconBundle } from "../model/enum/icons.js";
import { IndexItem, ItemType } from "../model/index.item.js";
import PathService from "../services/path.service.js";
import WikiService from "../services/wiki.service.js";

export default class IndexMenu {
	static readonly ID = "index-menu";
	static readonly TITLE_ID = "title";
	static readonly INDEX_LINK_ID = "index-link";
	static readonly LINK_SELECTED_CLASS = "selected";
	static readonly MENU_TOGGLE_SIGNAL = setSignal();

	static create(index: IndexItem): HTMLElement {
		const menu = uiComponent({
			type: Html.Div,
			id: this.ID,
		});

		connectToSignal(IndexMenu.MENU_TOGGLE_SIGNAL, async () => {
			if (menu.classList.contains("show")) menu.classList.remove("show");
			else menu.classList.add("show");
		});

		const title = uiComponent({
			type: Html.H1,
			id: this.TITLE_ID,
			text: getConfiguration(AppConfigurations.AppName),
			styles: {},
		});
		menu.appendChild(title);

		const options = uiComponent({
			type: Html.Div,
			classes: [BubbleUI.BoxColumn],
		});
		menu.appendChild(options);

		for (const key in index.files) {
			options.appendChild(this.createOption(key, key, index.files[key]));
		}

		for (let i = 0; i < 1000; i++) {
			options.appendChild(
				this.createOption("" + i, "" + i, {
					files: {},
					path: "",
					type: 1,
				}),
			);
		}

		return menu;
	}

	private static createOption(
		route: string,
		key: string,
		value: IndexItem,
		level: number = 0,
	): HTMLElement {
		switch (value.type) {
			case ItemType.Directory:
				const item = this.indexLink(route, key, level);
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
		name = PathService.getPascalCase(name);
		const text = PathService.decodeCustomUrl(name);

		const item = uiComponent({
			type: Html.A,
			id: this.INDEX_LINK_ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxYCenter, "hover-primary"],
			text: text,
			styles: { paddingLeft: `${2 + level}rem` },
			selectable: false,
			data: {
				route: route,
			},
		});

		if (null != route) {
			setDomAttributes(item, {
				href: PathService.getWikiViewRoute(route),
			});
		}

		setDomEvents(item, {
			click: () => {
				emitSignal(this.MENU_TOGGLE_SIGNAL, {});
				const items = document.querySelectorAll("#" + this.INDEX_LINK_ID);
			},
		});

		return item;
	}

	static setSelectedRoute() {
		document.querySelectorAll(`#${this.INDEX_LINK_ID}`).forEach((link) => {
			const htmlLink = link as HTMLAnchorElement;
			if (document.URL == htmlLink.href)
				link.classList.add(this.LINK_SELECTED_CLASS);
			else link.classList.remove(this.LINK_SELECTED_CLASS);
		});
	}
}
