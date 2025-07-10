import TopBar from "./components/bar.js";
import IndexMenu from "./components/menu.js";
import { BubbleUI } from "./lib/bubble.js";
import { getConfiguration, loadConfiguration } from "./lib/configuration.js";
import { Display } from "./lib/display.js";
import { uiComponent } from "./lib/dom.js";
import { loadIcons } from "./lib/icons.js";
import { getUrlParametersByBreakPoint } from "./lib/paths.js";
import { setNotFoundRoute, setRoute, showRoute } from "./lib/router.js";
import WikiService from "./services/wiki.service.js";
import HomeView from "./views/home.js";
import WikiView from "./views/wiki.js";

let documentContainer;

/**
 * When the dynamic URL changes loads
 * the correspoding view from the URL
 */
window.addEventListener("hashchange", start);

/**
 * When the window is loaded load
 * the app state to show
 */
window.onload = async function () {
  await loadConfiguration("gtdf.config.json");
  document.title = getConfiguration("base")["app_name"];
  Display.checkType();

  await loadIcons(
    "material",
    `${getConfiguration("path")["icons"]}/materialicons.json`,
  );
  await loadIcons(
    "social",
    `${getConfiguration("path")["icons"]}/socialicons.json`,
  );

  // create top bar
  const topBar = TopBar.create();
  document.body.appendChild(topBar);

  // load wiki index
  await WikiService.loadIndex();

  // content container
  const content = uiComponent({
    styles: {
      width: "100%",
      height: "calc(100% - 3rem)",
    },
    classes: [BubbleUI.BoxRow],
    selectable: false,
  });

  // menu
  const menu = IndexMenu.create(WikiService.index);
  content.appendChild(menu);

  // document container
  documentContainer = uiComponent({
    styles: {
      width: "100%",
      height: "100%",
    },
  });
  content.appendChild(documentContainer);

  document.body.appendChild(content);

  await start();
};

window.onresize = async function () {
  Display.checkType();
};

/**
 * Set routes
 */
function setRoutes(parent: HTMLElement) {
  setRoute("", HomeView.show);
  setRoute("/wiki", WikiView.show);
  showRoute(window.location.hash.slice(1).toLowerCase(), parent);
  //setNotFoundRoute(HomeView.show);
}

/**
 *  Start the web app
 */
async function start() {
  setRoutes(documentContainer);
}
