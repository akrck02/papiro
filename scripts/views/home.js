import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { uiComponent, } from "../lib/dom.js";
import { Html } from "../lib/html.js";
class HomeView {
    /**
     * Show home view
     */
    static async show(parameters, container) {
        const view = uiComponent({
            type: Html.View,
            id: HomeView.VIEW_ID,
            classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
        });
        const content = uiComponent({
            type: Html.Div,
            classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter],
            styles: {
                height: "100%",
                width: "100%",
            },
        });
        const logo = uiComponent({
            type: Html.Img,
            attributes: {
                src: `${getConfiguration("path")["icons"]}/logo.svg`,
            },
        });
        const title = uiComponent({
            type: Html.H1,
            id: HomeView.TITLE_ID,
            text: getConfiguration("base")["app_name"] + logo.outerHTML,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
        });
        content.appendChild(title);
        const subtitle = uiComponent({
            type: Html.H2,
            id: HomeView.SUBTITLE_ID,
            text: "The simple markdown wiki.",
        });
        content.appendChild(subtitle);
        const link = uiComponent({
            type: Html.A,
            id: HomeView.EXPLORE_LINK_ID,
            text: "Explore 👀",
            classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter],
            attributes: {
                href: `${getConfiguration("base")["web_url"]}/#/wiki`,
            },
        });
        content.appendChild(link);
        view.appendChild(content);
        container.appendChild(view);
    }
}
// HTML ids and classes
HomeView.VIEW_ID = "home";
HomeView.TITLE_ID = "title";
HomeView.SUBTITLE_ID = "subtitle";
HomeView.EXPLORE_LINK_ID = "explore";
export default HomeView;
