import { IndexItem, ItemType, orderedKeys } from "../model/index.item.js";

/** Links between pages: wiki route -> linked wiki routes */
export type WikiGraph = { [route: string]: string[] };
export type WikiColors = { [route: string]: string };

/** What search.json holds for a page: its title, sections and text */
export type SearchPage = { title: string; sections: { id: string; text: string }[]; text: string };
export type SearchIndex = { [route: string]: SearchPage };

/** A page found in the index */
export type WikiEntry = { route: string; item: IndexItem; directory: boolean };

/**
 * The files papiro-indexer wrote for a wiki, read from its folder url
 */
export class WikiData {
	private readonly base: URL;
	private cache = new Map<string, Promise<any>>();
	index: IndexItem;
	/** page routes in the order of the index */
	routes: string[] = [];

	constructor(source: string) {
		this.base = new URL(source.endsWith("/") ? source : `${source}/`, location.href);
	}

	/** absolute url of a file of the wiki */
	url(path: string): string {
		const clean = path.replace(/^\.?\//, "");
		const encoded = clean
			.split("/")
			.map((section) => encodeURIComponent(decodeURIComponent(section)))
			.join("/");
		return new URL(encoded, this.base).href;
	}

	async load() {
		this.index = await this.json<IndexItem>("index.json");
		this.routes = [];
		this.collect(this.index, "");
	}

	graph(): Promise<WikiGraph> {
		return this.optionalJson<WikiGraph>("graph.json");
	}

	colors(): Promise<WikiColors> {
		return this.optionalJson<WikiColors>("graph-colors.json");
	}

	/** the text of every page, empty for wikis indexed without it */
	search(): Promise<SearchIndex> {
		return this.optionalJson<SearchIndex>("search.json");
	}

	/** the page or folder of a route, "" is the first page */
	entry(route: string): WikiEntry | null {
		route = route.toLowerCase().replace(/^\/+|\/+$/g, "");
		if ("" == route) route = this.routes[0] ?? "";

		let item = this.index;
		for (const section of route.split("/")) {
			item = item?.files?.[section];
			if (undefined == item) return null;
		}

		return { route, item, directory: ItemType.Directory == item.type };
	}

	/** the html of a page */
	async html(entry: WikiEntry): Promise<string> {
		const folder = entry.route.substring(0, entry.route.lastIndexOf("/"));
		const path = "" == folder ? entry.item.path : `${folder}/${entry.item.path}`;
		const response = await fetch(this.url(path));
		if (!response.ok) throw new Error(`${response.status} ${path}`);
		return response.text();
	}

	private collect(item: IndexItem, route: string) {
		for (const key of orderedKeys(item)) {
			const child = item.files[key];
			const childRoute = "" == route ? key : `${route}/${key}`;
			if (ItemType.File == child.type) this.routes.push(childRoute.toLowerCase());
			else this.collect(child, childRoute);
		}
	}

	private json<T>(file: string): Promise<T> {
		if (!this.cache.has(file)) {
			this.cache.set(
				file,
				fetch(this.url(file)).then((response) => {
					if (!response.ok) throw new Error(`${response.status} ${file}`);
					return response.json();
				}),
			);
		}
		return this.cache.get(file);
	}

	/** files older indexers do not write, empty when missing */
	private optionalJson<T>(file: string): Promise<T> {
		return this.json<T>(file).catch(() => ({}) as T);
	}
}
