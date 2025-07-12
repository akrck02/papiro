import Breadcrumb from "../components/breadcrumb.js";
import Footer from "../components/footer.js";
import MarkdownCanvas from "../components/markdown.js";
import { BubbleUI } from "../lib/bubble.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
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
        const route = WikiService.getCurrentRoute();
        const breadcrumb = Breadcrumb.create(route, WikiService.index);
        view.appendChild(breadcrumb);
        WikiView.getDocumentHTML(route, WikiService.index).then((doc) => {
            view.appendChild(MarkdownCanvas.create(doc));
            view.appendChild(Footer.create());
        });
        container.appendChild(view);
        setTimeout(() => {
            view.style.opacity = "1";
        }, 100);
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
        const routeWithoutLastSection = PathService.getUrlWithoutLastSection(route);
        // get file HTML
        return WikiService.getDocumentHTML(PathService.getFullWikiResourcePath(PathService.createUrl([routeWithoutLastSection, indexItem.path])));
    }
    static createIndex(route, indexItem) {
        const index = uiComponent({});
        const title = uiComponent({
            type: Html.H1,
            text: `${route}`,
        });
        const list = uiComponent({ type: Html.Ul });
        for (const key in indexItem.files) {
            const listItem = uiComponent({ type: Html.Li });
            const link = uiComponent({
                type: Html.A,
                text: PathService.decodeCustomUrl(PathService.getPascalCase(key)),
                attributes: {
                    href: PathService.getWikiViewRoute(PathService.createUrl([route, key])),
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
