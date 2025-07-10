import { uiComponent } from "../lib/dom.js";
import WikiService from "../services/wiki.service.js";

export default class MarkdownCanvas {
	static readonly CLASS = "markdown";

	static create(markdown: string): HTMLElement {
		return uiComponent({
			classes: [MarkdownCanvas.CLASS],
			text: WikiService.render(markdown),
		});
	}
}
