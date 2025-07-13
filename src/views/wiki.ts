import Breadcrumb from "../components/breadcrumb.js";
import Footer from "../components/footer.js";
import MarkdownCanvas from "../components/markdown.js";
import { BubbleUI } from "../lib/bubble.js";
import {
	getConfiguration,
	isConfigurationActive,
} from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { AppConfigurations } from "../model/enum/configurations.js";
import {
	getIndexItemFromRoute,
	IndexItem,
	ItemType,
} from "../model/index.item.js";
import PathService from "../services/path.service.js";
import WikiService from "../services/wiki.service.js";

export default class WikiView {
	// HTML ids and classes
	static readonly VIEW_ID = "wiki";

	/**
	 * Show home view
	 */
	static async show(parameters: string[], container: HTMLElement) {
		const view = uiComponent({
			type: Html.View,
			id: WikiView.VIEW_ID,
			classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
		});

		const route = WikiService.getCurrentRoute();

		if (isConfigurationActive(AppConfigurations.ShowBreadCrumb)) {
			const breadcrumb = Breadcrumb.create(route, WikiService.index);
			view.appendChild(breadcrumb);
		}

		WikiView.getDocumentHTML(route, WikiService.index).then((doc) => {
			view.appendChild(MarkdownCanvas.create(doc));

			if (isConfigurationActive(AppConfigurations.ShowFooter))
				view.appendChild(Footer.create());
		});

		container.appendChild(view);
		setTimeout(() => {
			view.style.opacity = "1";
		}, 100);
	}

	static async getDocumentHTML(
		route: string,
		index: IndexItem,
	): Promise<string> {
		// If it is the home
		if ("" == route.trim()) {
			if (undefined == index["home"]) return "";
			route = "home";
		}
		const indexItem = getIndexItemFromRoute(index, route);

		// if it is a directory show a index
		if (ItemType.Directory == indexItem.type)
			return this.createIndex(route, indexItem);

		const routeWithoutLastSection = PathService.getUrlWithoutLastSection(route);

		// get file HTML
		return WikiService.getDocumentHTML(
			PathService.getFullWikiResourcePath(
				PathService.createUrl([routeWithoutLastSection, indexItem.path]),
			),
		);
	}

	private static createIndex(route: string, indexItem: IndexItem) {
		const index = uiComponent({});
		const title = uiComponent({
			type: Html.H1,
			text: `${route}`,
		});

		const list = uiComponent({ type: Html.Ul });
		for (const key in indexItem.files) {
			const listItem = uiComponent({ type: Html.Li });

			const link = uiComponent({
				type: Html.A,
				text: PathService.decodeCustomUrl(PathService.getPascalCase(key)),
				attributes: {
					href: PathService.createUrl([route, key]),
				},
			});
			listItem.appendChild(link);
			list.appendChild(listItem);
		}

		index.appendChild(title);
		index.appendChild(list);
		return index.outerHTML;
	}
}
