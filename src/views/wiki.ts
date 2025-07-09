import TopBar from "../components/bar.js";
import IndexMenu from "../components/menu.js";
import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { httpGet } from "../lib/http.js";
import { getUrlParametersByBreakPoint } from "../lib/paths.js";
import { getIndexItemFromRoute, Index, ItemType } from "../model/index.item.js";
import WikiService from "../services/wiki.service.js";

export default class WikiView {
	// HTML ids and classes
	static readonly VIEW_ID = "home";

	/**
	 * Show home view
	 */
	static async show(parameters: string[], container: HTMLElement) {
		const view = uiComponent({
			type: Html.View,
			id: WikiView.VIEW_ID,
			classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
		});

		const topBar = TopBar.create();
		view.appendChild(topBar);

		const content = uiComponent({
			type: Html.Div,
			classes: [BubbleUI.BoxRow],
			styles: {
				height: "100%",
				width: "100%",
			},
		});

		parameters = getUrlParametersByBreakPoint(window.location.hash, "#").slice(
			2,
		);

		const index = await WikiService.getIndex();
		const menu = IndexMenu.create(index);
		content.appendChild(menu);

		const route = parameters.join("/");
		const document = await WikiView.getDocumentHTML(route, index);
		const markdownCanvas = uiComponent({
			classes: ["markdown"],
			text: WikiService.render(document),
			styles: {
				width: "100%",
			},
		});

		content.appendChild(markdownCanvas);
		view.appendChild(content);
		container.appendChild(view);
	}

	static async getDocumentHTML(route: string, index: Index): Promise<string> {
		if ("" == route.trim()) return "<h1>Index here</h1>";

		const indexItem = getIndexItemFromRoute(index, route);

		if (ItemType.Directory == indexItem.type) {
			let title = "# Index for " + route;
			let list = "<ul>";
			for (const k in indexItem.files) {
				list += "<li>" + k + "</li>";
			}
			list += "</ul>";

			return `${title} ${list}`;
		}

		let path = `${getConfiguration("path")["wiki"]}/${route.substring(0, route.lastIndexOf("/"))}/${indexItem.path}`;

		const response = await httpGet({
			url: path,
			parameters: {},
		});
		return await response.text();
	}
}
