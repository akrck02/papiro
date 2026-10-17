import { isSmallDevice } from "../lib/browser.js";
import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, emitSignal } from "../lib/signals.js";
import {
	AppConfigurations,
	PathConfigurations,
} from "../model/enum/configurations.js";
import { IconBundle, MaterialIcons } from "../model/enum/icons.js";
import PathService from "../service/path.service.js";
import { Font, Theme, THEME_CHANGED_SIGNAL } from "../service/theme.js";
import IndexMenu from "./menu.js";
import Search from "./search.js";

/**
 * Get an icon, or an empty element if the icon set does not have it yet
 * (a cached icon set from an older version must not break the bar)
 */
function barIcon(icon: MaterialIcons): HTMLElement {
	return getIcon(IconBundle.Material, icon) ?? uiComponent({});
}

export default class TopBar {
	static readonly ID = "top-bar";
	static readonly LOGO_ID = "logo";
	static readonly TITLE_ID = "title";
	static readonly ICON_BAR_ID = "icon-bar-id";
	static readonly THEME_ICON_ID = "theme-icon";
	static readonly MENU_ICON_ID = "menu-icon";
	static readonly SEARCH_TRIGGER_ID = "search-trigger";
	static readonly SEARCH_ICON_ID = "search-icon";

	static create(): HTMLElement {
		const topBar = uiComponent({
			type: Html.Header,
			id: TopBar.ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXBetween, BubbleUI.BoxYCenter],
		});

		const logo = uiComponent({
			type: Html.Img,
			id: TopBar.LOGO_ID,
			attributes: {
				src: `${getConfiguration(AppConfigurations.Path)[PathConfigurations.Icons]}/logo.svg`,
			},
		});

		const navTitle = uiComponent({
			type: Html.A,
			id: TopBar.TITLE_ID,
			text: logo.outerHTML + getConfiguration(AppConfigurations.AppName),
			attributes: {
				href: `${PathService.getWebUrl()}#/`,
			},
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
		});

		topBar.appendChild(navTitle);

		// search trigger, the main way to search on desktop
		const searchTrigger = uiComponent({
			type: Html.Button,
			id: TopBar.SEARCH_TRIGGER_ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxYCenter],
			text: `${barIcon(MaterialIcons.Search).outerHTML}<span>Search the docs…</span><kbd>Ctrl K</kbd>`,
		});
		setDomEvents(searchTrigger, {
			click: () => Search.open(),
		});
		topBar.appendChild(searchTrigger);

		const iconBar = uiComponent({
			type: Html.Div,
			id: TopBar.ICON_BAR_ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXEnd],
		});
		topBar.appendChild(iconBar);

		const themeIconButton = uiComponent({
			id: TopBar.THEME_ICON_ID,
			styles: { cursor: "pointer" },
		});

		let themeIcon = barIcon(
			Theme.isDark() ? MaterialIcons.LightMode : MaterialIcons.DarkMode,
		);
		themeIconButton.appendChild(themeIcon);
		iconBar.appendChild(themeIconButton);

		connectToSignal(THEME_CHANGED_SIGNAL, async () => {
			themeIcon = barIcon(
				Theme.isDark() ? MaterialIcons.LightMode : MaterialIcons.DarkMode,
			);
			themeIconButton.innerHTML = themeIcon?.innerHTML;
		});

		setDomEvents(themeIconButton, {
			click: (e) => Theme.toggle(),
		});

		const fontIconButton = barIcon(MaterialIcons.TextFields);
		fontIconButton.id = "font-icon";
		fontIconButton.title = "Switch font";
		setDomEvents(fontIconButton, {
			click: () => Font.toggle(),
		});
		iconBar.insertBefore(fontIconButton, themeIconButton);

		const showMenuIcon = barIcon(MaterialIcons.MenuOpen);
		showMenuIcon.id = TopBar.MENU_ICON_ID;
		iconBar.appendChild(showMenuIcon);

		setDomEvents(showMenuIcon, {
			click: (e) => emitSignal(IndexMenu.MENU_TOGGLE_SIGNAL, {}),
		});

		const searchIcon = barIcon(MaterialIcons.Search);
		searchIcon.id = TopBar.SEARCH_ICON_ID;
		iconBar.appendChild(searchIcon);

		setDomEvents(searchIcon, {
			click: (e) => Search.toggle(),
		});

		return topBar;
	}
}
