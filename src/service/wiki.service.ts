import { getConfiguration } from "../lib/configuration.js";
import { httpGet } from "../lib/http.js";
import { Marked } from "../lib/markdown/markdown.js";
import { getUrlParametersByBreakPoint } from "../lib/paths.js";
import {
	AppConfigurations,
	PathConfigurations,
} from "../model/enum/configurations.js";
import { IndexItem } from "../model/index.item.js";
import PathService from "./path.service.js";

/** Links between pages: wiki route -> linked wiki routes */
export type WikiGraph = { [route: string]: string[] };

export default class WikiService {
	static index: IndexItem;
	static graph: WikiGraph;

	static render(markdown: string): string {
		return Marked.parse(markdown);
	}

	static async loadIndex(): Promise<IndexItem> {
		const route = PathService.getFullWikiResourcePath("index.json");
		const response = await httpGet({
			url: route,
			parameters: {},
		});
		this.index = await response.json();
		return this.index;
	}

	/**
	 * Load the links between pages, an empty graph if the
	 * wiki was indexed without them
	 */
	static async loadGraph(): Promise<WikiGraph> {
		if (undefined != this.graph) return this.graph;

		try {
			const response = await httpGet({
				url: PathService.getFullWikiResourcePath("graph.json"),
				parameters: {},
			});
			this.graph = response.ok ? await response.json() : {};
		} catch {
			this.graph = {};
		}

		return this.graph;
	}

	static async getDocumentHTML(path: string): Promise<string> {
		const response = await httpGet({
			url: path,
			parameters: {},
		});
		return await response.text();
	}

	static getCurrentRoute(sliceNum = 2): string {
		return decodeURI(
			getUrlParametersByBreakPoint(window.location.hash, "#")
				.slice(sliceNum)
				.join("/"),
		);
	}
}
