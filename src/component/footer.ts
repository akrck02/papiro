import Papiro from "../core/papiro.js";
import { uiComponent } from "../lib/dom.js";

export const PAPIRO_VERSION = "2.0.0";

/** The credits, or the html the host gave */
export default class Footer {
	static create(papiro: Papiro): HTMLElement | null {
		const footer = papiro.options.footer;
		if (false === footer) return null;

		const text =
			"string" == typeof footer
				? footer
				: `Powered by <a href="https://github.com/akrck02/papiro">Papiro</a> ${PAPIRO_VERSION}`;
		return uiComponent({ type: "footer", classes: ["papiro-footer"], text: text });
	}
}
