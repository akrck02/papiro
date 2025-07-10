import { getConfiguration } from "../lib/configuration.js";
import { httpGet } from "../lib/http.js";
import { Marked } from "../lib/markdown/markdown.js";
import { Index } from "../model/index.item.js";

export default class WikiService {
	static index: Index;

	static render(markdown: string): string {
		return Marked.parse(markdown);
	}

	static async loadIndex(): Promise<Index> {
		const response = await httpGet({
			url: `${getConfiguration("path")["wiki"]}/index.json`,
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
}
