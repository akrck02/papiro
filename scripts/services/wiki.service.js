import { getConfiguration } from "../lib/configuration.js";
import { httpGet } from "../lib/http.js";
import { Marked } from "../lib/markdown/markdown.js";
export default class WikiService {
    static render(markdown) {
        return Marked.parse(markdown);
    }
    static async loadIndex() {
        const response = await httpGet({
            url: `${getConfiguration("path")["wiki"]}/index.json`,
            parameters: {},
        });
        this.index = await response.json();
        return this.index;
    }
}
