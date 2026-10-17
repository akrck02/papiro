import Papiro from "../core/papiro.js";
import { uiComponent } from "../lib/dom.js";

/** The start page: logo, title, description and a way in */
export default class HomeView {
	static show(papiro: Papiro, container: HTMLElement) {
		const options = papiro.options;
		const home = uiComponent({ classes: ["papiro-home"] });

		const logo = "" != options.logo ? `<img src="${options.logo}" alt="">` : "";
		home.appendChild(uiComponent({ type: "h1", text: `${logo}${options.title}` }));
		if ("" != options.description) home.appendChild(uiComponent({ type: "p", text: options.description }));
		home.appendChild(papiro.link({ view: "page", route: "" }, "Start reading →", ["papiro-home-start"]));

		container.appendChild(home);
	}
}
