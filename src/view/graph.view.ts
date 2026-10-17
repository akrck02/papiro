import Graph from "../component/graph.js";
import Papiro from "../core/papiro.js";
import { uiComponent } from "../lib/dom.js";

/** The graph of every page and the links between them */
export default class GraphView {
	static async show(papiro: Papiro, container: HTMLElement) {
		const view = uiComponent({ classes: ["papiro-graph"] });
		container.appendChild(view);

		const [graph, colors] = await Promise.all([papiro.data.graph(), papiro.data.colors()]);
		const pages = Object.keys(graph).length;
		const links = Object.values(graph).reduce((sum, l) => sum + l.length, 0);

		const header = uiComponent({
			classes: ["papiro-graph-header"],
			text: `<h1>Graph</h1><p>${pages} pages · ${links} links · scroll to zoom, drag to move</p>`,
		});
		view.appendChild(header);

		if (0 == pages) {
			view.appendChild(
				uiComponent({ type: "p", classes: ["papiro-graph-empty"], text: "This wiki was indexed without links between pages." }),
			);
			return;
		}

		const canvas = Graph.createGlobal(papiro, graph, colors);
		view.appendChild(canvas);

		// fill the space left under the header
		const fit = () => {
			if (!canvas.isConnected) return;
			const bounds = view.getBoundingClientRect();
			Graph.resize(canvas, Math.floor(bounds.width), Math.floor(bounds.height - header.offsetHeight));
		};
		const observer = new ResizeObserver(fit);
		observer.observe(view);
	}
}
