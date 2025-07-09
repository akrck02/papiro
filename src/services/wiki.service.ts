import { getConfiguration } from "../lib/configuration.js";
import { httpGet } from "../lib/http.js";
import { Marked } from "../lib/markdown/markdown.js";
import { Index } from "../model/index.item.js";

export default class WikiService {
	static render(markdown: string): string {
		return Marked.parse(markdown);
	}

	static async getIndex(): Promise<Index> {
		const response = await httpGet({
			url: `${getConfiguration("path")["wiki"]}/index.json`,
			parameters: {},
		});
		return await response.json();
	}
}
