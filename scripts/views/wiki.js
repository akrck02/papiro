import MarkdownCanvas from "../components/markdown.js";
import { BubbleUI } from "../lib/bubble.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getUrlParametersByBreakPoint } from "../lib/paths.js";
import { getIndexItemFromRoute, ItemType, } from "../model/index.item.js";
import PathService from "../services/path.service.js";
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
        // If it is the home
        if ("" == route.trim()) {
            if (undefined == index["home"])
                return "";
            route = "home";
        }
        const indexItem = getIndexItemFromRoute(index, route);
        // if it is a directory show a index
        if (ItemType.Directory == indexItem.type)
            return this.createIndex(route, indexItem);
        // get file HTML
        return WikiService.getDocumentHTML(PathService.getFullWikiPath(route, indexItem.path));
    }
    static createIndex(route, indexItem) {
        const index = uiComponent({});
        const title = uiComponent({
            type: Html.H1,
            text: `Index for ${route}`,
        });
        const list = uiComponent({ type: Html.Ul });
        for (const key in indexItem.files) {
            const listItem = uiComponent({ type: Html.Li });
            const link = uiComponent({
                type: Html.A,
                text: key,
                attributes: {
                    href: key,
                },
            });
            listItem.appendChild(link);
            list.appendChild(listItem);
        }
        index.appendChild(title);
        index.appendChild(list);
        return index.outerHTML;
    }
}
// HTML ids and classes
WikiView.VIEW_ID = "wiki";
export default WikiView;
