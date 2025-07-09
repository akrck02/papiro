import TopBar from "../components/bar.js";
import { BubbleUI } from "../lib/bubble.js";
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
        const topBar = TopBar.create();
        view.appendChild(topBar);
        const content = uiComponent({
            type: Html.Div,
            classes: [BubbleUI.BoxRow],
            styles: {
                height: "100%",
                width: "100%",
            },
        });
        const link = uiComponent({
            type: Html.A,
            text: "Go to wiki",
            attributes: {
                href: "/#/wiki",
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
