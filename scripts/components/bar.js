import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, emitSignal } from "../lib/signals.js";
import { AppConfigurations, PathConfigurations, } from "../model/enum/configurations.js";
import { IconBundle, MaterialIcons } from "../model/enum/icons.js";
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
            attributes: {
                src: `${getConfiguration(AppConfigurations.Path)[PathConfigurations.Icons]}/logo.svg`,
            },
        });
        const navTitle = uiComponent({
            type: Html.A,
            id: TopBar.TITLE_ID,
            text: logo.outerHTML + getConfiguration(AppConfigurations.AppName),
            attributes: {
                href: `${getConfiguration(AppConfigurations.WebUrl)}/#/`,
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
        let themeIcon = getIcon(IconBundle.Material, Theme.isDark() ? MaterialIcons.LightMode : MaterialIcons.DarkMode);
        themeIconButton.appendChild(themeIcon);
        iconBar.appendChild(themeIconButton);
        connectToSignal(THEME_CHANGED_SIGNAL, async () => {
            themeIcon = getIcon(IconBundle.Material, Theme.isDark() ? MaterialIcons.LightMode : MaterialIcons.DarkMode);
            themeIconButton.innerHTML = themeIcon?.innerHTML;
        });
        setDomEvents(themeIconButton, {
            click: (e) => Theme.toggle(),
        });
        const showMenuIcon = getIcon(IconBundle.Material, MaterialIcons.MenuOpen);
        showMenuIcon.id = TopBar.MENU_ICON_ID;
        iconBar.appendChild(showMenuIcon);
        const searchIcon = getIcon(IconBundle.Material, MaterialIcons.Search);
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
