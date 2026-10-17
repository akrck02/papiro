import Graph from "../component/graph.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import WikiService from "../service/wiki.service.js";

/**
 * The graph of every page and the links between them
 */
export default class GraphView {
	static readonly VIEW_ID = "graph";

	static async show(parameters: string[], container: HTMLElement) {
		const view = uiComponent({ type: Html.View, id: GraphView.VIEW_ID });
		container.appendChild(view);

		const graph = await WikiService.loadGraph();
		const pages = Object.keys(graph).length;
		const links = Object.values(graph).reduce((sum, l) => sum + l.length, 0);

		const header = uiComponent({
			classes: ["graph-header"],
			text: `<h1>Graph</h1><p>${pages} pages · ${links} links · scroll to zoom, drag to move</p>`,
		});
		view.appendChild(header);

		if (0 == pages) {
			view.appendChild(
				uiComponent({
					type: Html.P,
					classes: ["graph-empty"],
					text: "This wiki was indexed without links between pages.",
				}),
			);
			return;
		}

		const colors = await WikiService.loadGraphColors();
		const canvas = Graph.createGlobal(graph, colors);
		view.appendChild(canvas);

		// fill the space left under the header
		const fit = () => {
			const bounds = view.getBoundingClientRect();
			Graph.resize(
				canvas,
				Math.floor(bounds.width),
				Math.floor(bounds.height - header.offsetHeight),
			);
		};
		new ResizeObserver(fit).observe(view);
		fit();
	}
}
