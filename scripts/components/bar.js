import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, emitSignal } from "../lib/signals.js";
import { Theme, THEME_CHANGED_SIGNAL } from "../services/theme.js";
import IndexMenu from "./menu.js";
class TopBar {
    static create() {
        const topBar = uiComponent({
            type: Html.Header,
            id: TopBar.ID,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxXBetween, BubbleUI.BoxYCenter],
        });
        const logo = uiComponent({
            type: Html.Img,
            id: TopBar.LOGO_ID,
            attributes: { src: `${getConfiguration("path")["icons"]}/logo.svg` },
        });
        const navTitle = uiComponent({
            type: Html.A,
            id: TopBar.TITLE_ID,
            text: logo.outerHTML + getConfiguration("base")["app_name"],
            attributes: {
                href: `${getConfiguration("base")["web_url"]}/#/`,
            },
            classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
        });
        topBar.appendChild(navTitle);
        const iconBar = uiComponent({
            type: Html.Div,
            id: TopBar.ICON_BAR_ID,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxXEnd],
        });
        topBar.appendChild(iconBar);
        const themeIconButton = uiComponent({
            id: TopBar.THEME_ICON_ID,
            styles: { cursor: "pointer" },
        });
        let themeIcon = getIcon("material", Theme.isDark() ? "light_mode" : "dark_mode");
        themeIconButton.appendChild(themeIcon);
        iconBar.appendChild(themeIconButton);
        connectToSignal(THEME_CHANGED_SIGNAL, async () => {
            themeIcon = getIcon("material", Theme.isDark() ? "light_mode" : "dark_mode");
            themeIconButton.innerHTML = themeIcon?.innerHTML;
        });
        setDomEvents(themeIconButton, {
            click: (e) => Theme.toggle(),
        });
        const showMenuIcon = getIcon("material", "menu_open");
        showMenuIcon.id = TopBar.MENU_ICON_ID;
        iconBar.appendChild(showMenuIcon);
        const searchIcon = getIcon("material", "search");
        iconBar.appendChild(searchIcon);
        setDomEvents(showMenuIcon, {
            click: (e) => emitSignal(IndexMenu.MENU_TOGGLE_SIGNAL, {}),
        });
        return topBar;
    }
}
TopBar.ID = "top-bar";
TopBar.LOGO_ID = "logo";
TopBar.TITLE_ID = "title";
TopBar.ICON_BAR_ID = "icon-bar-id";
TopBar.THEME_ICON_ID = "theme-icon";
TopBar.MENU_ICON_ID = "menu-icon";
export default TopBar;
