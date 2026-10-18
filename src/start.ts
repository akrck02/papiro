/**
 * The papiro website: the library over the whole page, configured with
 * gtdf.config.json (written by papiro-deploy) and remembering the
 * theme and the font of the reader.
 */
import { createPapiro, PapiroFont, PapiroTheme } from "./papiro.js";

const PREFERENCES = "papiro-preferences";

type Preferences = { theme?: PapiroTheme; font?: PapiroFont };

function preferences(): Preferences {
	try {
		return JSON.parse(localStorage.getItem(PREFERENCES) ?? "{}");
	} catch {
		return {};
	}
}

function remember(change: Preferences) {
	localStorage.setItem(PREFERENCES, JSON.stringify({ ...preferences(), ...change }));
}

window.addEventListener("load", async () => {
	const config = await fetch("gtdf.config.json").then((response) => response.json());
	const paths = config.path ?? {};
	document.title = config.app_name ?? "Papiro";

	const saved = preferences();
	await createPapiro(document.body, {
		source: paths.wiki ?? "resources/wiki",
		title: config.app_name ?? "Papiro",
		description: config.app_description ?? "",
		logo: `${paths.icons ?? "resources/icons"}/logo.svg`,
		startPage: true == config.show_start_page,
		breadcrumb: false != config.show_breadcrumb,
		footer: true == config.show_footer,
		theme: saved.theme ?? "auto",
		accent: config.accent ?? "",
		font: saved.font ?? "system",
		shortcuts: true,
		onThemeChange: (theme) => remember({ theme }),
		onFontChange: (font) => remember({ font }),
	});
});
