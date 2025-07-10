import { uiComponent } from "../lib/dom.js";
import WikiService from "../services/wiki.service.js";
class MarkdownCanvas {
    static create(markdown) {
        return uiComponent({
            classes: [MarkdownCanvas.CLASS],
            text: WikiService.render(markdown),
        });
    }
}
MarkdownCanvas.CLASS = "markdown";
export default MarkdownCanvas;
