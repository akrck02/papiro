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

export default class WikiService {
	static index: IndexItem;

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
