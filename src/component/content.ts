import Papiro from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";

/**
 * The html of a page, as papiro-indexer wrote it: internal links go through
 * the instance router, images and files come from the wiki folder
 */
export default class Content {
	/**
	 * @param folder the folder of the page in the wiki, relative addresses
	 * that papiro-indexer did not resolve are taken from it
	 */
	static create(papiro: Papiro, html: string, folder: string = ""): HTMLElement {
		// a template does not load anything: images are only requested once their
		// address points to the wiki folder (WebKit loaded "./images/…" right away)
		const template = document.createElement("template");
		template.innerHTML = html;
		const content = uiComponent({ classes: ["papiro-content"] });
		Content.prepare(papiro, template.content, folder);
		content.appendChild(template.content);
		Content.prepareSections(content);
		return content;
	}

	private static prepare(papiro: Papiro, content: DocumentFragment, folder: string) {

		content.querySelectorAll("a[href]").forEach((link) => Content.prepareLink(papiro, link as HTMLAnchorElement));
		content.querySelectorAll("img[src]").forEach((image) => Content.prepareImage(papiro, image as HTMLImageElement, folder));
		content.querySelectorAll("source[srcset], img[srcset]").forEach((source) => Content.prepareSrcset(papiro, source, folder));
		content.querySelectorAll("blockquote").forEach((quote) => Content.prepareCallout(quote));
		content.querySelectorAll("pre > code").forEach((code) => Content.prepareCode(code as HTMLElement));
	}

	/** "#id" links scroll to their section inside the page */
	private static prepareSections(content: HTMLElement) {
		content.querySelectorAll("a[data-papiro-section]").forEach((link) => {
			link.addEventListener("click", (event) => {
				event.preventDefault();
				const id = decodeURIComponent(link.getAttribute("href").substring(1));
				content.querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
			});
		});
	}

	/** "./route" is a page, "./file.pdf" a file of the wiki, "#id" a section */
	private static prepareLink(papiro: Papiro, link: HTMLAnchorElement) {
		const href = link.getAttribute("href");

		if (href.startsWith("#") && !href.startsWith("#/")) {
			link.setAttribute("data-papiro-section", "");
			return;
		}

		if (!href.startsWith("./")) return;

		const path = href.substring(2).split("#")[0];
		if (/\.[a-z0-9]+$/i.test(path)) {
			link.href = papiro.data.url(path);
			return;
		}

		const target = { view: "page" as const, route: decodeURIComponent(path) };
		link.href = papiro.href(target);
		link.setAttribute("data-papiro-target", JSON.stringify(target));
		link.removeAttribute("target");
	}

	/**
	 * The address of a file of the wiki: "./x" comes from the root (papiro-indexer
	 * resolved it), other relative addresses from the folder of the page.
	 * Absolute addresses, data: and blob: urls are kept.
	 */
	private static fileUrl(papiro: Papiro, address: string, folder: string): string {
		if (address.startsWith("./")) return papiro.data.url(address.substring(2));
		if ("" == address || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(address)) return address;
		return papiro.data.url("" == folder ? address : `${folder}/${address}`);
	}

	private static prepareSrcset(papiro: Papiro, element: Element, folder: string) {
		const srcset = element.getAttribute("srcset")
			.split(",")
			.map((candidate) => {
				const [address, ...descriptor] = candidate.trim().split(/\s+/);
				return [Content.fileUrl(papiro, address, folder), ...descriptor].join(" ");
			})
			.join(", ");
		element.setAttribute("srcset", srcset);
	}

	private static prepareImage(papiro: Papiro, image: HTMLImageElement, folder: string) {
		image.src = Content.fileUrl(papiro, image.getAttribute("src"), folder);
		image.loading = "lazy";
		image.addEventListener("click", () => image.classList.toggle("zoomed"));
	}

	/** quotes starting with a bold title are callouts (the obsidian indexer writes them that way) */
	private static prepareCallout(quote: Element) {
		const title = quote.querySelector(":scope > p:first-child > strong:first-child");
		if (null == title) return;

		quote.classList.add("callout");
		if (/warning|caution|danger|careful|cuidado|atenci/i.test(title.textContent ?? ""))
			quote.classList.add("warning");
	}

	/** the language of a code block and a button to copy it */
	private static prepareCode(code: HTMLElement) {
		const pre = code.parentElement;
		const language = [...code.classList]
			.find((name) => name.startsWith("language-"))
			?.substring("language-".length);

		if (language) pre.appendChild(uiComponent({ type: "span", classes: ["papiro-code-language"], text: language }));

		const copy = uiComponent({
			type: "button",
			classes: ["papiro-code-copy"],
			text: icon("content_copy", 16),
			attributes: { "aria-label": "Copy", title: "Copy" },
		});
		copy.onclick = () => navigator.clipboard?.writeText(code.innerText);
		pre.appendChild(copy);
	}
}
