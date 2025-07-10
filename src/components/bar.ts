import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal } from "../lib/signals.js";
import { Theme, THEME_CHANGED_SIGNAL } from "../services/theme.js";

export default class TopBar {
	static readonly ID = "top-bar";
	static readonly LOGO_ID = "logo";
	static readonly TITLE_ID = "title";
	static readonly THEME_ICON_ID = "theme-icon";

	static create(): HTMLElement {
		const topBar = uiComponent({
			type: Html.Header,
			id: TopBar.ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXBetween, BubbleUI.BoxYCenter],
		});

		const logo = uiComponent({
			type: Html.Img,
			id: TopBar.LOGO_ID,
			attributes: { src: `${getConfiguration("path")["icons"]}/logo.svg` },
		});

		const navTitle = uiComponent({
			type: Html.A,
			id: TopBar.TITLE_ID,
			text: logo.outerHTML + getConfiguration("base")["app_name"],
			attributes: {
				href: `${getConfiguration("base")["web_url"]}/#/`,
			},
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
		});

		topBar.appendChild(navTitle);

		const iconBar = uiComponent({
			type: Html.Div,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXEnd],
		});
		topBar.appendChild(iconBar);

		const themeIconButton = uiComponent({
			id: TopBar.THEME_ICON_ID,
			styles: { cursor: "pointer" },
		});

		let themeIcon = getIcon(
			"material",
			Theme.isDark() ? "light_mode" : "dark_mode",
		);
		themeIconButton.appendChild(themeIcon);
		iconBar.appendChild(themeIconButton);

		connectToSignal(THEME_CHANGED_SIGNAL, async () => {
			themeIcon = getIcon(
				"material",
				Theme.isDark() ? "light_mode" : "dark_mode",
			);
			themeIconButton.innerHTML = themeIcon?.innerHTML;
		});

		setDomEvents(themeIconButton, {
			click: (e) => Theme.toggle(),
		});

		return topBar;
	}
}
