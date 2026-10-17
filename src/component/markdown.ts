import { setDomAttributes, setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { IconBundle, MaterialIcons } from "../model/enum/icons.js";
import PathService from "../service/path.service.js";

export default class MarkdownCanvas {
	static readonly CLASS = "markdown";
	/**
	 * Show a page, its html comes ready from papiro-indexer
	 * (parsing it again as markdown broke code with backticks)
	 */
	static create(html: string): HTMLElement {
		const canvas = uiComponent({
			classes: [MarkdownCanvas.CLASS],
			text: html,
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

		this.prepareCallouts(canvas);

		canvas.querySelectorAll("pre code").forEach((code) => {
			const codeHtml = code as HTMLElement;
			const pre = codeHtml.parentElement;

			// show the language of the block
			const language = [...codeHtml.classList]
				.find((name) => name.startsWith("language-"))
				?.substring("language-".length);
			if (language) {
				pre.appendChild(
					uiComponent({
						type: Html.Span,
						classes: ["code-language"],
						text: language,
					}),
				);
			}
			const copyButton = uiComponent({
				type: Html.Button,
				classes: ["copy-button"],
				text: getIcon(
					IconBundle.Material,
					MaterialIcons.ContentCopy,
					"1rem",
					"var(--text-faint)",
				).outerHTML,
			});

			setDomEvents(copyButton, {
				click: () => {
					navigator.clipboard.writeText(codeHtml.innerText);
				},
			});

			pre.appendChild(copyButton);
		});

		return canvas;
	}

	/**
	 * Mark quotes starting with a bold title as callouts
	 * (the obsidian indexer writes them that way)
	 */
	private static prepareCallouts(canvas: HTMLElement) {
		canvas.querySelectorAll("blockquote").forEach((quote) => {
			const title = quote.querySelector(":scope > p:first-child > strong:first-child");
			if (null == title) return;

			quote.classList.add("callout");
			if (/warning|caution|danger|careful|cuidado|atenci/i.test(title.textContent ?? ""))
				quote.classList.add("warning");
		});
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
			img.removeAttribute("src");
			img.addEventListener("click", () => img.classList.toggle("zoomed"));

			imageObserver.observe(img);
		});
	}
}
