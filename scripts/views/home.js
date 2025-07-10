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
            styles: {
                height: "6rem",
                marginRight: ".75rem",
            },
        });
        const title = uiComponent({
            type: Html.H1,
            text: getConfiguration("base")["app_name"] + logo.outerHTML,
            styles: {
                fontSize: "6rem",
            },
            classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
        });
        content.appendChild(title);
        const subtitle = uiComponent({
            type: Html.H1,
            text: "The simple markdown wiki.",
            styles: {
                fontSize: "1.25rem",
                marginBottom: "4rem",
                color: "var(--on-surface-2)",
                opacity: ".65",
            },
        });
        content.appendChild(subtitle);
        const link = uiComponent({
            type: Html.A,
            text: "Explore 👀",
            classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter],
            attributes: {
                href: `${getConfiguration("base")["web_url"]}/#/wiki`,
            },
            styles: {
                background: "var(--surface-2)",
                padding: "1rem 2rem",
                borderRadius: "5rem",
                fontSize: "1.5rem",
                opacity: ".85",
                color: "var(--on-surface-2)",
            },
        });
        content.appendChild(link);
        view.appendChild(content);
        container.appendChild(view);
    }
}
// HTML ids and classes
HomeView.VIEW_ID = "home";
export default HomeView;
