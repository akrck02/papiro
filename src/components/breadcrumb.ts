import { BubbleUI } from "../lib/bubble.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { IconBundle, MaterialIcons } from "../model/enum/icons.js";
import { Index } from "../model/index.item.js";
import PathService from "../services/path.service.js";

export default class Breadcrumb {
	static ID = "breadcrumb";
	static SECTION_CLASS = "br-section";
	static SECTION_NEXT_ICON_CLASS = "br-section-next-icon";
	static CURRENT_SECTION_CLASS = "current";

	static create(route: string, index: Index): HTMLElement {
		const breadcrumb = uiComponent({
			type: Html.Div,
			id: this.ID,
			classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
		});

		const sections = route.split("/");
		if (2 > sections.length) {
			breadcrumb.classList.add("hide");
			return breadcrumb;
		}

		let currentRoute = "";
		for (let i = 0; i < sections.length; i++) {
			const isNotLastSection = i < sections.length - 1;
			currentRoute += sections[i];
			this.addSection(sections[i], currentRoute, isNotLastSection, breadcrumb);
			if (isNotLastSection) currentRoute += "/";
		}

		return breadcrumb;
	}

	static addSection(
		text: string,
		route: string,
		isNotLastSection: boolean,
		parent: HTMLElement,
	) {
		const sectionLink = uiComponent({
			type: Html.A,
			text: PathService.decodeCustomUrl(text),
			classes: [this.SECTION_CLASS],
			attributes: {
				href: PathService.getWikiViewRoute(route),
			},
		});
		parent.appendChild(sectionLink);

		if (isNotLastSection) {
			const icon = getIcon(IconBundle.Material, MaterialIcons.Next);
			icon.classList.add(
				BubbleUI.BoxColumn,
				BubbleUI.BoxCenter,
				this.SECTION_NEXT_ICON_CLASS,
			);
			parent.appendChild(icon);
		} else {
			sectionLink.classList.add(this.CURRENT_SECTION_CLASS);
		}
	}
}
