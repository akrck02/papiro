import { uiComponent } from "../lib/dom.js";
import WikiService from "../services/wiki.service.js";
export default class MarkdownCanvas {
    static create(markdown) {
        return uiComponent({
            classes: ["markdown"],
            text: WikiService.render(markdown),
            styles: {
                width: "100%",
            },
        });
    }
}
