import TopBar from "../components/bar.js";
import IndexMenu from "../components/menu.js";
import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import {
  removeAllDomBySelector,
  setDomEvents,
  setDomStyles,
  uiComponent,
} from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { httpGet } from "../lib/http.js";
import { getIcon } from "../lib/icons.js";
import { connectToSignal, setSignal } from "../lib/signals.js";
import { Theme, THEME_CHANGED_SIGNAL } from "../services/theme.js";
import WikiService from "../services/wiki.service.js";

export default class HomeView {
  // HTML ids and classes
  static readonly VIEW_ID = "home";
  static readonly TITLE_ID = "title";
  static readonly SUBTITLE_ID = "subtitle";
  static readonly EXPLORE_LINK_ID = "explore";

  /**
   * Show home view
   */
  static async show(parameters: string[], container: HTMLElement) {
    const view = uiComponent({
      type: Html.View,
      id: HomeView.VIEW_ID,
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
    });

    const content = uiComponent({
      type: Html.Div,
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter],
      styles: {
        height: "100%",
        width: "100%",
      },
    });

    const logo = uiComponent({
      type: Html.Img,
      attributes: {
        src: `${getConfiguration("path")["icons"]}/logo.svg`,
      },
    });

    const title = uiComponent({
      type: Html.H1,
      id: HomeView.TITLE_ID,
      text: getConfiguration("base")["app_name"] + logo.outerHTML,
      classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
    });
    content.appendChild(title);

    const subtitle = uiComponent({
      type: Html.H2,
      id: HomeView.SUBTITLE_ID,
      text: "The simple markdown wiki.",
    });
    content.appendChild(subtitle);

    const link = uiComponent({
      type: Html.A,
      id: HomeView.EXPLORE_LINK_ID,
      text: "Explore 👀",
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxCenter],
      attributes: {
        href: `${getConfiguration("base")["web_url"]}/#/wiki`,
      },
    });
    content.appendChild(link);

    view.appendChild(content);
    container.appendChild(view);
  }
}
