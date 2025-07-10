import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomAttributes, uiComponent, } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { ItemType } from "../model/index.item.js";
export default class IndexMenu {
    static create(index) {
        const menu = uiComponent({
            type: Html.Div,
            styles: {
                background: "var(--surface-2)",
                width: "25rem",
                minWidth: "25rem",
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
                marginBottom: "1rem",
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
            case ItemType.Directory:
                const item = this.indexButton(null, key, level);
                const container = uiComponent({
                    classes: [BubbleUI.BoxColumn],
                });
                container.appendChild(item);
                for (const key in value.files) {
                    container.appendChild(this.createOption(`${route}/${key}`.toLocaleLowerCase(), key, value.files[key], container, level + 1));
                }
                return container;
            case ItemType.File:
                const itemHtml = this.indexButton(route, key, level);
                return itemHtml;
        }
    }
    static indexButton(route, name, level) {
        const isDirectory = null == route;
        name = name.substring(0, 1).toUpperCase().concat(name.substring(1));
        const text = isDirectory
            ? `${getIcon("material", "expand", "1rem", "var(--on-surface-1)").outerHTML} &nbsp;${name}`
            : `${getIcon("material", "tag", "1rem", "var(--on-surface-1)").outerHTML} &nbsp;${name}`;
        const item = uiComponent({
            type: Html.A,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxYCenter, "hover-primary"],
            text: text,
            styles: {
                paddingLeft: `${1 + level}rem`,
                marginTop: "0.2rem",
                paddingTop: ".8rem",
                paddingBottom: ".8rem",
                borderRadius: ".65rem",
                fontSize: "1.25rem",
                color: "var(--on-surface-1)",
                cursor: "pointer",
            },
            selectable: false,
        });
        if (null != route) {
            setDomAttributes(item, {
                href: `${getConfiguration("base")["web_url"]}/#/${route}`.toLocaleLowerCase(),
            });
        }
        return item;
    }
}
