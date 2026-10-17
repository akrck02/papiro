import Breadcrumb from "../component/breadcrumb.js";
import Footer from "../component/footer.js";
import Graph from "../component/graph.js";
import isMobileDisplay from "../lib/display.js";
import MarkdownCanvas from "../component/markdown.js";
import IndexMenu from "../component/menu.js";
import { BubbleUI } from "../lib/bubble.js";
import {
  getConfiguration,
  isConfigurationActive,
} from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { AppConfigurations } from "../model/enum/configurations.js";
import {
  getIndexItemFromRoute,
  IndexItem,
  ItemType,
} from "../model/index.item.js";
import PathService from "../service/path.service.js";
import WikiService from "../service/wiki.service.js";

export default class WikiView {
  // HTML ids and classes
  static readonly VIEW_ID = "wiki";

  /**
   * Show home view
   */
  static async show(parameters: string[], container: HTMLElement) {
    const view = uiComponent({
      type: Html.View,
      id: WikiView.VIEW_ID,
      classes: [BubbleUI.BoxColumn, BubbleUI.BoxYCenter],
    });

    const route = WikiService.getCurrentRoute();

    const page = uiComponent({ classes: ["page"] });
    const article = uiComponent({ type: Html.Article });
    const toc = uiComponent({ type: Html.Aside, classes: ["toc"] });
    page.appendChild(article);
    page.appendChild(toc);
    view.appendChild(page);

    if (isConfigurationActive(AppConfigurations.ShowBreadCrumb)) {
      const breadcrumb = Breadcrumb.create(route, WikiService.index);
      article.appendChild(breadcrumb);
    }

    WikiView.getDocumentHTML(route, WikiService.index).then((doc) => {
      const canvas = MarkdownCanvas.create(doc);
      article.appendChild(canvas);

      WikiView.addPageMeta(canvas);
      WikiView.fillTableOfContents(toc, canvas, view);
      // on phones the side column is hidden, the graph goes after the page
      const pager = WikiView.createPager(route);
      const graphPlace = isMobileDisplay() ? article : toc;
      WikiView.addLocalGraph(graphPlace, route).then(() => {
        if (null != pager) article.appendChild(pager);
        if (isConfigurationActive(AppConfigurations.ShowFooter))
          article.appendChild(Footer.create());
      });

    });

    container.appendChild(view);
    setTimeout(() => {
      view.style.opacity = "1";
    }, 100);
  }

  /**
   * Show the reading time under the title
   */
  private static addPageMeta(canvas: HTMLElement) {
    const title = canvas.querySelector(":scope > h1");
    if (null == title) return;

    const words = canvas.innerText.split(/\s+/).filter((w) => "" != w).length;
    const minutes = Math.max(1, Math.round(words / 220));
    const meta = uiComponent({
      type: Html.P,
      classes: ["page-meta"],
      text: `${minutes} min read`,
    });
    title.after(meta);
  }

  /**
   * Fill the "on this page" index with the document sections,
   * it scrolls instead of using the url hash, that is used for routing.
   */
  private static fillTableOfContents(
    toc: HTMLElement,
    canvas: HTMLElement,
    view: HTMLElement,
  ) {
    const headings = [...canvas.querySelectorAll("h2, h3")] as HTMLElement[];
    if (2 > headings.length) return;

    toc.appendChild(uiComponent({ type: Html.P, text: "On this page" }));
    const list = uiComponent({ type: Html.Ul });
    toc.appendChild(list);

    const links = headings.map((heading) => {
      const link = uiComponent({
        type: Html.A,
        text: heading.textContent ?? "",
        classes: [`level-${heading.tagName.substring(1)}`],
        attributes: { href: "javascript:void(0)" },
      });
      link.onclick = () =>
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
      const item = uiComponent({ type: Html.Li });
      item.appendChild(link);
      list.appendChild(item);
      return link;
    });

    // highlight the section being read
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = headings.indexOf(entry.target as HTMLElement);
          links.forEach((link, i) => link.classList.toggle("on", i == index));
        });
      },
      { root: view, rootMargin: "0px 0px -70% 0px" },
    );
    headings.forEach((heading) => observer.observe(heading));
    links[0].classList.add("on");
  }

  /**
   * Show the pages linked to and from this one
   */
  private static async addLocalGraph(aside: HTMLElement, route: string) {
    const graph = await WikiService.loadGraph();
    const colors = await WikiService.loadGraphColors();
    if ("" == route.trim()) {
      const routes: string[] = [];
      WikiView.collectRoutes(WikiService.index, "", routes);
      route = routes[0] ?? "";
    }

    const localGraph = Graph.createLocal(route.toLowerCase(), graph, colors);
    if (undefined != localGraph) aside.appendChild(localGraph);
  }

  /**
   * Create the previous / next links following the index order
   */
  private static createPager(route: string): HTMLElement {
    const routes: string[] = [];
    WikiView.collectRoutes(WikiService.index, "", routes);
    if ("" == route.trim()) route = routes[0];

    const position = routes.indexOf(route.toLowerCase());
    if (-1 == position) return null;

    const pager = uiComponent({ type: Html.Nav, classes: ["pager"] });
    const add = (target: string, label: string, className: string) => {
      const name = target.substring(target.lastIndexOf("/") + 1);
      pager.appendChild(
        uiComponent({
          type: Html.A,
          classes: [className],
          text: `<small>${label}</small>${PathService.getPascalCase(PathService.decodeCustomUrl(name))}`,
          attributes: { href: PathService.getWikiViewRoute(target) },
        }),
      );
    };

    if (0 < position) add(routes[position - 1], "← Previous", "previous");
    if (position < routes.length - 1)
      add(routes[position + 1], "Next →", "next");
    return pager;
  }

  private static collectRoutes(item: IndexItem, route: string, routes: string[]) {
    for (const key in item.files) {
      const child = item.files[key];
      const childRoute = "" == route ? key : `${route}/${key}`;
      if (ItemType.File == child.type) routes.push(childRoute.toLowerCase());
      else WikiView.collectRoutes(child, childRoute, routes);
    }
  }

  static async getDocumentHTML(
    route: string,
    index: IndexItem,
  ): Promise<string> {
    // If it is the home
    if ("" == route.trim()) {
      route = Object.keys(index.files)[0];
      IndexMenu.setFirstAsSelected();
    } else {
      IndexMenu.setSelectedRoute();
    }
    const indexItem = getIndexItemFromRoute(index, route);

    // if it is a directory show a index
    if (ItemType.Directory == indexItem.type)
      return this.createIndex(route, indexItem);

    const routeWithoutLastSection = PathService.getUrlWithoutLastSection(route);

    // get file HTML
    return WikiService.getDocumentHTML(
      PathService.getFullWikiResourcePath(
        PathService.createUrl([routeWithoutLastSection, indexItem.path]),
      ),
    );
  }

  private static createIndex(route: string, indexItem: IndexItem) {
    const index = uiComponent({
      classes: ["index-page"],
    });

    const title = uiComponent({
      type: Html.H1,
      text: `${route}`,
    });

    const separator = uiComponent({ type: Html.Hr });

    const list = uiComponent({ type: Html.Ul });
    for (const key in indexItem.files) {
      const listItem = uiComponent({ type: Html.Li });

      const link = uiComponent({
        type: Html.A,
        text: PathService.decodeCustomUrl(PathService.getPascalCase(key)),
        attributes: {
          href: PathService.createUrl([route, key]),
        },
      });
      listItem.appendChild(link);
      list.appendChild(listItem);
    }

    index.appendChild(title);
    index.appendChild(separator);
    index.appendChild(list);
    return index.outerHTML;
  }
}
