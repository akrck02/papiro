import Papiro from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";

export default class NotFoundView {
	static show(papiro: Papiro, container: HTMLElement) {
		const view = uiComponent({ classes: ["papiro-not-found"] });
		view.appendChild(uiComponent({ text: icon("search", 64) }));
		view.appendChild(uiComponent({ type: "h1", text: "Page not found" }));
		view.appendChild(papiro.link({ view: "page", route: "" }, "Go to the first page"));
		container.appendChild(view);
	}
}
