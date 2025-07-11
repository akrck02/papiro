import { BubbleUI } from "../lib/bubble.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import PathService from "../services/path.service.js";
export default class Breadcrumb {
    static create(route, index) {
        const breadcrumb = uiComponent({
            type: Html.Div,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
            styles: {
                width: "100%",
                height: "3rem",
                padding: "0rem 1rem",
                fontSize: "1rem",
                background: "",
                borderBottom: ".1rem solid var(--surface-2)",
            },
        });
        const sections = route.split("/");
        let currentRoute = "";
        for (let i = 0; i < sections.length; i++) {
            const isNotLastSection = i < sections.length - 1;
            currentRoute += sections[i];
            const sectionLink = uiComponent({
                type: Html.A,
                text: PathService.decodeCustomUrl(sections[i]),
                attributes: {
                    href: PathService.getWikiViewRoute(currentRoute, true),
                },
                styles: {
                    margin: "1rem",
                    color: isNotLastSection
                        ? "var(--on-surface)"
                        : "var(--primary-color)",
                    cursor: "pointer",
                },
            });
            breadcrumb.appendChild(sectionLink);
            if (isNotLastSection) {
                const icon = getIcon("material", "next");
                icon.classList.add(BubbleUI.BoxColumn, BubbleUI.BoxCenter);
                breadcrumb.appendChild(icon);
                currentRoute += "/";
            }
        }
        return breadcrumb;
    }
}
