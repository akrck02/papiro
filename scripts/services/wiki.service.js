import { httpGet } from "../lib/http.js";
import { Marked } from "../lib/markdown/markdown.js";
import { getUrlParametersByBreakPoint } from "../lib/paths.js";
import PathService from "./path.service.js";
export default class WikiService {
    static render(markdown) {
        return Marked.parse(markdown);
    }
    static async loadIndex() {
        const route = PathService.getFullWikiResourcePath("index.json");
        const response = await httpGet({
            url: route,
            parameters: {},
        });
        this.index = await response.json();
        return this.index;
    }
    static async getDocumentHTML(path) {
        const response = await httpGet({
            url: path,
            parameters: {},
        });
        return await response.text();
    }
    static getCurrentRoute(sliceNum = 2) {
        return decodeURI(getUrlParametersByBreakPoint(window.location.hash, "#")
            .slice(sliceNum)
            .join("/"));
    }
}
