import Breadcrumb from "../component/breadcrumb.js";
import Content from "../component/content.js";
import Footer from "../component/footer.js";
import Graph from "../component/graph.js";
import { pageName } from "../component/names.js";
import { WikiEntry } from "../core/data.js";
import Papiro from "../core/papiro.js";
import { uiComponent } from "../lib/dom.js";
import { ItemType } from "../model/index.item.js";
import NotFoundView from "./not.found.view.js";

/**
 * A page of the wiki with its index, its local graph and the
 * links to the previous and next pages; a folder lists its pages
 */
export default class PageView {
	static async show(papiro: Papiro, container: HTMLElement, route: string) {
		const entry = papiro.data.entry(route);
		if (null == entry) {
			NotFoundView.show(papiro, container);
			return;
		}

		const page = uiComponent({ classes: ["papiro-page"] });
		const article = uiComponent({ type: "article" });
		const side = uiComponent({ type: "aside", classes: ["papiro-side"] });
		page.append(article, side);
		container.appendChild(page);

		if (papiro.options.breadcrumb) {
			const breadcrumb = Breadcrumb.create(papiro, entry.route);
			if (null != breadcrumb) article.appendChild(breadcrumb);
		}

		let content: HTMLElement;
		try {
			content = entry.directory
				? PageView.folder(papiro, entry)
				: Content.create(papiro, await papiro.data.html(entry));
		} catch {
			NotFoundView.show(papiro, container);
			page.remove();
			return;
		}
		article.appendChild(content);

		PageView.addReadingTime(content);
		PageView.addTableOfContents(side, content);

		if (papiro.options.graph) {
			const [graph, colors] = await Promise.all([papiro.data.graph(), papiro.data.colors()]);
			const local = Graph.createLocal(papiro, entry.route, graph, colors);
			// on narrow places the side column is hidden, the graph goes after the page
			if (null != local) (papiro.isNarrow() ? article : side).appendChild(local);
		}

		if ("wiki" == papiro.options.layout) {
			const pager = PageView.pager(papiro, entry.route);
			if (null != pager) article.appendChild(pager);
		}

		const footer = Footer.create(papiro);
		if (null != footer) article.appendChild(footer);
	}

	/** a folder lists its pages */
	private static folder(papiro: Papiro, entry: WikiEntry): HTMLElement {
		const folder = uiComponent({ classes: ["papiro-content", "papiro-folder"] });
		folder.appendChild(uiComponent({ type: "h1", text: pageName(entry.route) }));
		const list = uiComponent({ classes: ["papiro-folder-list"] });
		for (const key in entry.item.files) {
			const child = entry.item.files[key];
			const name = ItemType.Directory == child.type ? `${pageName(key)}/` : pageName(key);
			list.appendChild(papiro.link({ view: "page", route: `${entry.route}/${key}` }, name));
		}
		folder.appendChild(list);
		return folder;
	}

	private static addReadingTime(content: HTMLElement) {
		const title = content.querySelector(":scope > h1");
		if (null == title || content.classList.contains("papiro-folder")) return;

		const words = (content.textContent ?? "").split(/\s+/).filter((w) => "" != w).length;
		const minutes = Math.max(1, Math.round(words / 220));
		title.after(uiComponent({ type: "p", classes: ["papiro-page-meta"], text: `${minutes} min read` }));
	}

	/**
	 * "On this page": it scrolls to the sections, the address
	 * may belong to the router or to the host app
	 */
	private static addTableOfContents(side: HTMLElement, content: HTMLElement) {
		const headings = [...content.querySelectorAll("h2, h3")] as HTMLElement[];
		if (headings.length < 2) return;

		const toc = uiComponent({ type: "nav", classes: ["papiro-toc"] });
		toc.appendChild(uiComponent({ type: "p", text: "On this page" }));
		const list = uiComponent({ type: "ul" });
		toc.appendChild(list);
		side.appendChild(toc);

		const links = headings.map((heading) => {
			const link = uiComponent({
				type: "a",
				text: heading.textContent ?? "",
				classes: [`level-${heading.tagName.substring(1)}`],
				attributes: { href: "#" },
			});
			link.onclick = (event) => {
				event.preventDefault();
				heading.scrollIntoView({ behavior: "smooth", block: "start" });
			};
			const item = uiComponent({ type: "li" });
			item.appendChild(link);
			list.appendChild(item);
			return link;
		});
		links[0].classList.add("on");

		// mark the section being read, once the page is in its scroll container
		requestAnimationFrame(() => {
			const scroller = content.closest(".papiro-main");
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						const index = headings.indexOf(entry.target as HTMLElement);
						links.forEach((link, i) => link.classList.toggle("on", i == index));
					}
				},
				{ root: scroller, rootMargin: "0px 0px -70% 0px" },
			);
			headings.forEach((heading) => observer.observe(heading));
		});
	}

	/** previous and next pages, in the order of the menu */
	private static pager(papiro: Papiro, route: string): HTMLElement | null {
		const routes = papiro.data.routes;
		const position = routes.indexOf(route);
		if (-1 == position) return null;

		const pager = uiComponent({ type: "nav", classes: ["papiro-pager"] });
		if (0 < position) {
			const previous = routes[position - 1];
			pager.appendChild(papiro.link({ view: "page", route: previous }, `<small>← Previous</small>${pageName(previous)}`, ["previous"]));
		}
		if (position < routes.length - 1) {
			const next = routes[position + 1];
			pager.appendChild(papiro.link({ view: "page", route: next }, `<small>Next →</small>${pageName(next)}`, ["next"]));
		}
		return pager;
	}
}
