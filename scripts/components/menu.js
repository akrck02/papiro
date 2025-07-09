import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
export default class IndexMenu {
    static create(index) {
        const menu = uiComponent({
            type: Html.Div,
            styles: {
                background: "var(--surface-2)",
                width: "30rem",
                height: "100%",
                padding: "1rem",
            },
        });
        const searchBar = uiComponent({
            type: Html.Input,
            attributes: {
                placeholder: "Search...",
            },
            styles: {
                width: "100%",
                margin: "0",
                background: "var(--surface-3)",
            },
        });
        menu.appendChild(searchBar);
        const options = uiComponent({
            type: Html.Div,
            classes: [BubbleUI.BoxColumn],
        });
        menu.appendChild(options);
        for (const key in index) {
            options.appendChild(this.createOption(`${getConfiguration("views")["wiki"]}/${key}`.toLocaleLowerCase(), key, index[key], options));
        }
        return menu;
    }
    static createOption(route, key, value, parent, level = 0) {
        switch (value.type) {
            case 1:
                const item = this.indexButton(route, key, level);
                const container = uiComponent({
                    classes: [BubbleUI.BoxColumn],
                });
                container.appendChild(item);
                for (const key in value.files) {
                    container.appendChild(this.createOption(`${route}/${key}`.toLocaleLowerCase(), key, value.files[key], container, level + 1));
                }
                return container;
            case 2:
                const itemHtml = this.indexButton(route, key, level);
                return itemHtml;
        }
    }
    static indexButton(route, name, level) {
        const item = uiComponent({
            type: Html.A,
            text: `⤷ ${name}`,
            styles: {
                paddingLeft: `${level}rem`,
                paddingTop: "1rem",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "var(--on-surface-3)",
            },
            attributes: {
                href: `http://localhost:8000/#/${route}`.toLocaleLowerCase(),
            },
        });
        return item;
    }
}
