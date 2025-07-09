import TopBar from "../components/bar.js";
import IndexMenu from "../components/menu.js";
import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import {
	removeAllDomBySelector,
	setDomEvents,
	setDomStyles,
	uiComponent,
} from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { httpGet } from "../lib/http.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, setSignal } from "../lib/signals.js";
import { Theme, THEME_CHANGED_SIGNAL } from "../services/theme.js";
import WikiService from "../services/wiki.service.js";

export default class HomeView {
	// HTML ids and classes
	static readonly VIEW_ID = "home";

	/**
	 * Show home view
	 */
	static async show(parameters: string[], container: HTMLElement) {
		const view = uiComponent({
			type: Html.View,
			id: HomeView.VIEW_ID,
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

		const link = uiComponent({
			type: Html.A,
			text: "Go to wiki",
			attributes: {
				href: "/#/wiki",
			},
		});
		content.appendChild(link);

		view.appendChild(content);
		container.appendChild(view);
	}
}
