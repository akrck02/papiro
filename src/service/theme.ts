import { getConfiguration, setConfiguration } from "../lib/configuration.js";
import { setDomDataset } from "../lib/dom.js";
import { emitSignal, setSignal } from "../lib/signals.js";

export const THEME_CHANGED_SIGNAL = setSignal();
export class Theme {
	static toggle() {
		if (document.documentElement.dataset.theme == "dark") this.setLight();
		else this.setDark();
		emitSignal(THEME_CHANGED_SIGNAL, {});
	}

	static setDark() {
		setDomDataset(document.documentElement, { theme: "dark" });
		setConfiguration("theme", "dark");
	}

	static setLight() {
		setDomDataset(document.documentElement, { theme: "light" });
		setConfiguration("theme", "light");
	}

	static isDark(): boolean {
		return document.documentElement.dataset["theme"] == "dark";
	}
}

/**
 * Reading font: the system one (default) or the papiro fonts
 */
export class Font {
	// "font" was saved on every visit when papiro fonts were the default,
	// a new key lets everyone start with system-ui
	static readonly CONFIGURATION_KEY = "font_family";

	static isPapiroChosen(): boolean {
		return getConfiguration(this.CONFIGURATION_KEY) == "papiro";
	}

	static toggle() {
		if (this.isSystem()) this.setPapiro();
		else this.setSystem();
	}

	static setSystem() {
		setDomDataset(document.documentElement, { font: "system" });
		setConfiguration(this.CONFIGURATION_KEY, "system");
	}

	static setPapiro() {
		setDomDataset(document.documentElement, { font: "papiro" });
		setConfiguration(this.CONFIGURATION_KEY, "papiro");
	}

	static isSystem(): boolean {
		return document.documentElement.dataset["font"] == "system";
	}
}
