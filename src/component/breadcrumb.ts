import Papiro from "../core/papiro.js";
import { icon } from "../core/icons.js";
import { uiComponent } from "../lib/dom.js";
import { pageName } from "./names.js";

/** The folders of the page being read */
export default class Breadcrumb {
	static create(papiro: Papiro, route: string): HTMLElement | null {
		const sections = route.split("/");
		if (sections.length < 2) return null;

		const breadcrumb = uiComponent({ type: "nav", classes: ["papiro-breadcrumb"] });
		sections.forEach((section, i) => {
			const sectionRoute = sections.slice(0, i + 1).join("/");
			if (i == sections.length - 1) {
				breadcrumb.appendChild(uiComponent({ type: "span", classes: ["current"], text: pageName(section) }));
				return;
			}
			breadcrumb.appendChild(papiro.link({ view: "page", route: sectionRoute }, pageName(section)));
			breadcrumb.appendChild(uiComponent({ type: "span", classes: ["separator"], text: icon("next", 14) }));
		});
		return breadcrumb;
	}
}
