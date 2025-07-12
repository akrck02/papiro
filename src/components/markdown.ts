import { uiComponent } from "../lib/dom.js";
import PathService from "../services/path.service.js";
import WikiService from "../services/wiki.service.js";

export default class MarkdownCanvas {
	static readonly CLASS = "markdown";
	static create(markdown: string): HTMLElement {
		const markdownCanvas = uiComponent({
			classes: [MarkdownCanvas.CLASS],
			text: WikiService.render(markdown),
		});

		markdownCanvas.querySelectorAll("img").forEach((img) => {
			const imgHtml = img as HTMLImageElement;
			const webUrl = PathService.getWebUrl();
			if (-1 != imgHtml.src.indexOf(webUrl)) {
				const newUrl = img.src.substring(PathService.getWebUrl().length);
				imgHtml.src = PathService.getFullWikiResourcePath(newUrl);
			}
		});

		markdownCanvas.querySelectorAll("a").forEach((img) => {
			const aHtml = img as HTMLAnchorElement;
			const webUrl = PathService.getWebUrl();
			if (-1 != aHtml.href.indexOf(webUrl)) {
				const newUrl = img.href.substring(PathService.getWebUrl().length);
				aHtml.href = PathService.getWikiViewRoute(newUrl);
			}
		});

		return markdownCanvas;
	}
}
