import MarkdownCanvas from "../components/markdown.js";
import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { httpGet } from "../lib/http.js";
import { getUrlParametersByBreakPoint } from "../lib/paths.js";
import { getIndexItemFromRoute, ItemType } from "../model/index.item.js";
import WikiService from "../services/wiki.service.js";
class WikiView {
    /**
     * Show home view
     */
    static async show(parameters, container) {
        const view = uiComponent({
            type: Html.View,
            id: WikiView.VIEW_ID,
            classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
            styles: {
                width: "100%",
                maxWidth: "80rem",
                height: "100%",
            },
        });
        const route = getUrlParametersByBreakPoint(window.location.hash, "#")
            .slice(2)
            .join("/");
        WikiView.getDocumentHTML(route, WikiService.index).then((doc) => {
            const canvas = MarkdownCanvas.create(doc);
            view.appendChild(canvas);
        });
        container.appendChild(view);
    }
    static async getDocumentHTML(route, index) {
        if ("" == route.trim()) {
            if (undefined == index["home"])
                return "<h1>Index here</h1>";
            route = "home";
        }
        const indexItem = getIndexItemFromRoute(index, route);
        if (ItemType.Directory == indexItem.type) {
            let title = "# Index for " + route;
            let list = "<ul>";
            for (const k in indexItem.files) {
                list += "<li>" + k + "</li>";
            }
            list += "</ul>";
            return `${title} ${list}`;
        }
        let path = `${getConfiguration("base")["web_url"]}/${getConfiguration("path")["wiki"]}/${route.substring(0, route.lastIndexOf("/"))}/${indexItem.path}`;
        const response = await httpGet({
            url: path,
            parameters: {},
        });
        return await response.text();
    }
}
// HTML ids and classes
WikiView.VIEW_ID = "home";
export default WikiView;
