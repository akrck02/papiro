import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomAttributes, setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, emitSignal, setSignal } from "../lib/signals.js";
import { ItemType } from "../model/index.item.js";
import PathService from "../services/path.service.js";
import WikiService from "../services/wiki.service.js";
class IndexMenu {
    static create(index) {
        // menu
        const menu = uiComponent({
            type: Html.Div,
            id: this.ID,
        });
        connectToSignal(IndexMenu.MENU_TOGGLE_SIGNAL, async () => {
            if (menu.classList.contains("show")) {
                menu.classList.remove("show");
            }
            else {
                menu.classList.add("show");
            }
        });
        const title = uiComponent({
            type: Html.H1,
            id: this.TITLE_ID,
            text: getConfiguration("base")["app_name"],
            styles: {},
        });
        menu.appendChild(title);
        // options
        const options = uiComponent({
            type: Html.Div,
            classes: [BubbleUI.BoxColumn],
        });
        menu.appendChild(options);
        // create index options
        for (const key in index) {
            options.appendChild(this.createOption(PathService.getWikiViewRoute(key), key, index[key]));
        }
        return menu;
    }
    static createOption(route, key, value, level = 0) {
        switch (value.type) {
            case ItemType.Directory:
                const item = this.indexLink(null, key, level);
                const container = uiComponent({
                    classes: [BubbleUI.BoxColumn],
                });
                container.appendChild(item);
                for (const key in value.files) {
                    container.appendChild(this.createOption(`${route}/${key}`.toLocaleLowerCase(), key, value.files[key], level + 1));
                }
                return container;
            case ItemType.File:
                return this.indexLink(route, key, level);
        }
    }
    static indexLink(route, name, level) {
        const isDirectory = null == route;
        name = PathService.getPascalCase(name);
        const selected = "wiki/" + WikiService.getCurrentRoute() == route;
        const text = PathService.decodeCustomUrl(name);
        const item = uiComponent({
            type: Html.A,
            id: this.INDEX_LINK_ID,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxYCenter, "hover-primary"],
            text: text,
            styles: { paddingLeft: `${2 + level}rem` },
            selectable: false,
            data: {
                route: route,
            },
        });
        if (selected) {
            item.classList.add("selected");
        }
        if (null != route) {
            setDomAttributes(item, { href: PathService.getRoute(route) });
        }
        setDomEvents(item, {
            click: () => {
                emitSignal(this.MENU_TOGGLE_SIGNAL, {});
                const items = document.querySelectorAll("#" + this.INDEX_LINK_ID);
                for (const it of items) {
                    it.classList.remove("selected");
                }
                item.classList.add("selected");
            },
        });
        return item;
    }
    static getIndexLinkIcon(icon) {
        return getIcon("material", icon, "1rem", "var(--on-surface-1)");
    }
}
IndexMenu.ID = "index-menu";
IndexMenu.TITLE_ID = "title";
IndexMenu.INDEX_LINK_ID = "index-link";
IndexMenu.MENU_TOGGLE_SIGNAL = setSignal();
export default IndexMenu;
