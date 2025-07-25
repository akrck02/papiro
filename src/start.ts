import TopBar from "./components/bar.js";
import IndexMenu from "./components/menu.js";
import Search from "./components/search.js";
import { BubbleUI } from "./lib/bubble.js";
import {
	getConfiguration,
	isConfigurationActive,
	loadConfiguration,
	setConfigurationId,
} from "./lib/configuration.js";
import { Display } from "./lib/display.js";
import { uiComponent } from "./lib/dom.js";
import { loadIcons } from "./lib/icons.js";
import {
	setHomeRoute,
	setNotFoundRoute,
	setRoute,
	showRoute,
} from "./lib/router.js";
import Shortcuts from "./lib/shortcuts.js";
import { AppConfigurations } from "./model/enum/configurations.js";
import { IconBundle } from "./model/enum/icons.js";
import { Theme } from "./services/theme.js";
import WikiService from "./services/wiki.service.js";
import HomeView from "./views/home.js";
import NotFound from "./views/not.found.js";
import WikiView from "./views/wiki.js";

let documentContainer: HTMLElement;

/**
 * When the dynamic URL changes loads
 * the correspoding view from the URL
 */
window.addEventListener("hashchange", start);

/**
 * When the window is loaded load
 * the app state to show
 */
window.onload = async function () {
	await loadConfiguration("gtdf.config.json");
	document.title = getConfiguration(AppConfigurations.AppName);
	Display.checkType();

	// load configuration
	const isDarkTheme = getConfiguration("theme") == "dark";
	if (isDarkTheme) {
		Theme.setDark();
	} else {
		Theme.setLight();
	}

	await getIcons();

	// create top bar
	const topBar = TopBar.create();
	document.body.appendChild(topBar);

	const search = Search.create();
	document.body.appendChild(search);

	// load wiki index
	await WikiService.loadIndex();

	// content container
	const content = uiComponent({
		styles: {
			width: "100%",
			height: "calc(100% - 3rem)",
		},
		classes: [BubbleUI.BoxRow],
		selectable: false,
	});

	// menu
	const menu = IndexMenu.create(WikiService.index);
	content.appendChild(menu);

	// document container
	documentContainer = uiComponent({
		styles: {
			width: "100%",
			height: "100%",
		},
	});
	content.appendChild(documentContainer);
	document.body.appendChild(content);
	await start();
};

window.onresize = async function () {
	Display.checkType();
};

/**
 * Get app icons
 */
async function getIcons() {
	await loadIcons(
		IconBundle.Material,
		`${getConfiguration("path")["icons"]}/materialicons.json`,
	);
}

/**
 * Set routes
 */
function setRoutes(parent: HTMLElement) {
	if (isConfigurationActive(AppConfigurations.ShowStartPage))
		setHomeRoute(HomeView.show);
	else setHomeRoute(WikiView.show);

	setNotFoundRoute(NotFound.show);
	setRoute("/wiki", WikiView.show);
	showRoute(window.location.hash.slice(1).toLowerCase(), parent);
}

/**
 *  Start the web app
 */
async function start() {
	setRoutes(documentContainer);
}
