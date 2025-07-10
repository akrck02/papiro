import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { setDomEvents, uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal } from "../lib/signals.js";
import { Theme, THEME_CHANGED_SIGNAL } from "../services/theme.js";

export default class TopBar {
  static create(): HTMLElement {
    const topBar = uiComponent({
      type: Html.Div,
      classes: [BubbleUI.BoxRow, BubbleUI.BoxXBetween, BubbleUI.BoxYCenter],
      styles: {
        padding: ".5rem 1rem",
        width: "100%",
        height: "3rem",
        background: "var(--surface-1)",
      },
    });

    const logo = uiComponent({
      type: Html.Img,
      attributes: {
        src: `${getConfiguration("path")["icons"]}/logo.svg`,
      },
      styles: {
        height: "1.5rem",
        marginRight: ".75rem",
      },
    });

    const navTitle = uiComponent({
      type: Html.A,
      text: logo.outerHTML + getConfiguration("base")["app_name"],
      styles: {
        fontSize: "1.25rem",
        color: "var(--on-surface-3)",
      },
      attributes: {
        href: getConfiguration("base")["web_url"],
      },
      classes: [BubbleUI.BoxRow, BubbleUI.BoxXStart, BubbleUI.BoxYCenter],
    });

    topBar.appendChild(navTitle);

    const iconBar = uiComponent({
      type: Html.Div,
      classes: [BubbleUI.BoxRow, BubbleUI.BoxXEnd],
    });
    topBar.appendChild(iconBar);

    const themeIconButton = uiComponent({
      styles: { cursor: "pointer" },
    });
    const themeIcon = getIcon(
      "material",
      Theme.isDark() ? "light_mode" : "dark_mode",
      "24px",
      "var(--on-surface-1)",
    );
    themeIcon.id = "theme-icon";
    themeIconButton.appendChild(themeIcon);
    iconBar.appendChild(themeIconButton);

    connectToSignal(THEME_CHANGED_SIGNAL, async () => {
      themeIconButton.innerHTML = getIcon(
        "material",
        Theme.isDark() ? "light_mode" : "dark_mode",
        "24px",
        "var(--on-surface-1)",
      )?.innerHTML;
    });

    setDomEvents(themeIconButton, {
      click: (e) => Theme.toggle(),
    });

    return topBar;
  }
}
