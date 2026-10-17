import { setConfiguration } from "../lib/configuration.js";
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
 * Reading font: the papiro fonts or the system one
 */
export class Font {
	static toggle() {
		if (this.isSystem()) this.setPapiro();
		else this.setSystem();
	}

	static setSystem() {
		setDomDataset(document.documentElement, { font: "system" });
		setConfiguration("font", "system");
	}

	static setPapiro() {
		setDomDataset(document.documentElement, { font: "papiro" });
		setConfiguration("font", "papiro");
	}

	static isSystem(): boolean {
		return document.documentElement.dataset["font"] == "system";
	}
}
