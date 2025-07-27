import { setDomAttributes, setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { IconBundle, MaterialIcons } from "../model/enum/icons.js";
import PathService from "../services/path.service.js";
import WikiService from "../services/wiki.service.js";

export default class MarkdownCanvas {
	static readonly CLASS = "markdown";
	static create(markdown: string): HTMLElement {
		const canvas = uiComponent({
			classes: [MarkdownCanvas.CLASS],
			text: WikiService.render(markdown),
		});

		this.prepareImageTags(canvas);

		canvas.querySelectorAll("a").forEach((img) => {
			const aHtml = img as HTMLAnchorElement;
			const webUrl = PathService.getWebUrl();
			if (-1 != aHtml.href.indexOf(webUrl)) {
				const newUrl = img.href.substring(PathService.getWebUrl().length);
				aHtml.href = PathService.getWikiViewRoute(newUrl);
			}
		});

		canvas.querySelectorAll("pre code").forEach((code) => {
			const codeHtml = code as HTMLElement;
			const copyButton = uiComponent({
				type: Html.Button,
				classes: ["copy-button"],
				text: getIcon(
					IconBundle.Material,
					MaterialIcons.ContentCopy,
					"1rem",
					"var(--surface-6)",
				).outerHTML,
			});

			setDomEvents(copyButton, {
				click: () => {
					navigator.clipboard.writeText(codeHtml.innerText);
				},
			});

			codeHtml.appendChild(copyButton);
		});

		return canvas;
	}

	private static prepareImageTags(canvas: HTMLElement) {
		const options = {
			root: canvas,
			rootMargin: "0px",
			scrollMargin: "0px",
			threshold: 1.0,
		};

		const imageObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;

				const img = entry.target as HTMLImageElement;
				img.src = img.dataset.src;
				img.onload = () => {
					img.classList.remove("lazy");
					observer.unobserve(img);
				};
			});
		}, options);

		canvas.querySelectorAll("img").forEach((img) => {
			const imgHtml = img as HTMLImageElement;
			imgHtml.loading = "lazy";
			imgHtml.classList.add("lazy");

			const webUrl = PathService.getWebUrl();
			if (-1 != imgHtml.src.indexOf(webUrl)) {
				const newUrl = img.src.substring(PathService.getWebUrl().length);
				imgHtml.src = PathService.getFullWikiResourcePath(newUrl);
			}

			img.dataset.src = img.src;
			img.src = undefined;

			imageObserver.observe(img);
		});
	}
}
