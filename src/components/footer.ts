import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { AppConfigurations } from "../model/enum/configurations.js";

export default class Footer {
	static create(): HTMLElement {
		const footer = uiComponent({
			type: Html.Footer,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
			styles: {
				marginTop: "2rem",
				padding: "1rem 2rem 6rem 2rem",
				width: "100%",
				borderTop: "0.1rem solid var(--surface-2)",
				maxWidth: "75rem",
			},
		});

		const text = uiComponent({
			type: Html.P,
			classes: [BubbleUI.TextCenter],
			text: `Powered by ${getConfiguration(AppConfigurations.CoreName)} ${getConfiguration(AppConfigurations.CoreVersion)}, made with 🩵 by ${getConfiguration(AppConfigurations.Author)}`,
			styles: {
				fontSize: "1rem",
				fontHeight: "135%",
				color: "var(--surface-6)",
			},
		});

		footer.appendChild(text);

		return footer;
	}
}
