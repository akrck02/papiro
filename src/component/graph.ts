import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { connectToSignal } from "../lib/signals.js";
import PathService from "../service/path.service.js";
import { THEME_CHANGED_SIGNAL } from "../service/theme.js";
import { WikiGraph } from "../service/wiki.service.js";

type GraphNode = {
	route: string;
	name: string;
	/** colour of its obsidian graph group */
	color?: string;
	links: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
};

type GraphEdge = { from: GraphNode; to: GraphNode };

type CanvasOptions = {
	/** the page being read, drawn in the accent colour */
	current?: GraphNode;
	/** names are always shown up to this number of pages */
	labelsUpTo: number;
	/** drag to move and wheel to zoom */
	interactive: boolean;
};

/**
 * Graphs of the links between pages, placed with a small force
 * simulation and drawn on a canvas with the theme colours.
 */
export default class Graph {
	static readonly LOCAL_CLASS = "local-graph";
	static readonly LOCAL_SIZE = 220;
	static readonly LOCAL_MIN_NODES = 6;
	static readonly LOCAL_MAX_NODES = 40;
	static readonly STEPS = 300;

	/**
	 * The page, the pages it links to or is linked from,
	 * and their neighbours when there are few
	 */
	static createLocal(
		route: string,
		graph: WikiGraph,
		colors: { [route: string]: string } = {},
	): HTMLElement {
		if (undefined == graph[route]) return undefined;

		const routes = [route];
		const add = (r: string) => {
			if (!routes.includes(r) && routes.length < this.LOCAL_MAX_NODES)
				routes.push(r);
		};
		this.neighbours(route, graph).forEach(add);
		if (routes.length < this.LOCAL_MIN_NODES) {
			[...routes].forEach((r) => this.neighbours(r, graph).forEach(add));
		}

		const { nodes, edges } = this.layout(routes, graph, true, colors);
		const container = uiComponent({ classes: [this.LOCAL_CLASS] });

		const header = uiComponent({
			classes: ["local-graph-header"],
			text: `<p>Linked pages</p><a href="${PathService.getWebUrl()}#/graph">Open graph</a>`,
		});
		container.appendChild(header);

		const canvas = this.canvas(nodes, edges, {
			current: nodes[0],
			labelsUpTo: 5,
			interactive: false,
		});
		this.resize(canvas, this.LOCAL_SIZE, this.LOCAL_SIZE);
		container.appendChild(canvas);

		if (1 == nodes.length) {
			container.appendChild(
				uiComponent({ type: Html.Span, text: "No links to other pages yet." }),
			);
		}

		return container;
	}

	/**
	 * Every page of the wiki
	 */
	static createGlobal(
		graph: WikiGraph,
		colors: { [route: string]: string } = {},
	): HTMLCanvasElement {
		const routes = Object.keys(graph).sort();
		const { nodes, edges } = this.layout(routes, graph, false, colors);
		return this.canvas(nodes, edges, { labelsUpTo: 12, interactive: true });
	}

	/** Set the drawing size of a graph canvas */
	static resize(canvas: HTMLCanvasElement, width: number, height: number) {
		canvas.dispatchEvent(
			new CustomEvent("graph-resize", { detail: { width, height } }),
		);
	}

	private static neighbours(route: string, graph: WikiGraph): string[] {
		return [
			...(graph[route] ?? []),
			...Object.keys(graph).filter((k) => graph[k].includes(route)),
		];
	}

	/**
	 * Create the nodes and place them: they push each other away,
	 * links pull like springs and a soft gravity keeps them together
	 */
	private static layout(
		routes: string[],
		graph: WikiGraph,
		anchorFirst: boolean,
		colors: { [route: string]: string },
	): { nodes: GraphNode[]; edges: GraphEdge[] } {
		// start on a spiral so the result is the same on every visit
		const nodes: GraphNode[] = routes.map((route, i) => {
			const angle = i * 2.4;
			const radius = anchorFirst && 0 == i ? 0 : 20 * Math.sqrt(i + 1);
			return {
				route: route,
				name: this.pageName(route),
				color: colors[route],
				links: this.neighbours(route, graph).length,
				x: radius * Math.cos(angle),
				y: radius * Math.sin(angle),
				vx: 0,
				vy: 0,
			};
		});

		const byRoute = new Map(nodes.map((n) => [n.route, n]));
		const edges: GraphEdge[] = [];
		for (const node of nodes) {
			for (const target of graph[node.route] ?? []) {
				const to = byRoute.get(target);
				if (undefined != to) edges.push({ from: node, to: to });
			}
		}

		const repulsion = 900;
		const spring = 0.05;
		const length = 55;
		const gravity = 0.01;
		const damping = 0.85;

		for (let step = 0; step < this.STEPS; step++) {
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const a = nodes[i];
					const b = nodes[j];
					const dx = a.x - b.x || 0.01;
					const dy = a.y - b.y || 0.01;
					const distance2 = Math.max(dx * dx + dy * dy, 1);
					const distance = Math.sqrt(distance2);
					const force = repulsion / distance2;
					a.vx += (dx / distance) * force;
					a.vy += (dy / distance) * force;
					b.vx -= (dx / distance) * force;
					b.vy -= (dy / distance) * force;
				}
			}

			for (const edge of edges) {
				const dx = edge.to.x - edge.from.x;
				const dy = edge.to.y - edge.from.y;
				const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
				const force = (distance - length) * spring;
				edge.from.vx += (dx / distance) * force;
				edge.from.vy += (dy / distance) * force;
				edge.to.vx -= (dx / distance) * force;
				edge.to.vy -= (dy / distance) * force;
			}

			for (const node of nodes) {
				node.vx = (node.vx - node.x * gravity) * damping;
				node.vy = (node.vy - node.y * gravity) * damping;
				node.x += node.vx;
				node.y += node.vy;
			}

			if (anchorFirst && 0 < nodes.length) {
				nodes[0].x = 0;
				nodes[0].y = 0;
			}
		}

		return { nodes, edges };
	}

	private static canvas(
		nodes: GraphNode[],
		edges: GraphEdge[],
		options: CanvasOptions,
	): HTMLCanvasElement {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		let width = 0;
		let height = 0;
		let hovered: GraphNode = undefined;

		// view: zoom and the offset of the graph centre on the screen
		let fit = 1;
		let zoom = 1;
		let offsetX = 0;
		let offsetY = 0;

		const neighbours = new Map<GraphNode, Set<GraphNode>>(
			nodes.map((n) => [n, new Set<GraphNode>()]),
		);
		for (const edge of edges) {
			neighbours.get(edge.from).add(edge.to);
			neighbours.get(edge.to).add(edge.from);
		}

		const scale = () => fit * zoom;
		const toScreen = (n: GraphNode) => ({
			x: width / 2 + offsetX + n.x * scale(),
			y: height / 2 + offsetY + n.y * scale(),
		});
		const radius = (n: GraphNode) =>
			n == options.current ? 6 : Math.min(2.5 + Math.sqrt(n.links), 7);

		const render = () => {
			if (0 == width) return;
			const style = getComputedStyle(document.documentElement);
			const color = (name: string) => style.getPropertyValue(name).trim();
			const font = color("--font") || "sans-serif";
			const ratio = window.devicePixelRatio || 1;

			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			context.clearRect(0, 0, width, height);

			const isNear = (n: GraphNode) =>
				undefined == hovered || n == hovered || neighbours.get(hovered).has(n);

			for (const edge of edges) {
				const from = toScreen(edge.from);
				const to = toScreen(edge.to);
				const active =
					undefined != hovered && (edge.from == hovered || edge.to == hovered);
				context.globalAlpha = undefined == hovered || active ? 1 : 0.35;
				context.strokeStyle = active ? color("--graph-focus") : color("--graph-line");
				context.lineWidth = active ? 1.5 : 1;
				context.beginPath();
				context.moveTo(from.x, from.y);
				context.lineTo(to.x, to.y);
				context.stroke();
			}

			const showAllLabels = nodes.length <= options.labelsUpTo || zoom >= 1.8;
			for (const node of nodes) {
				const point = toScreen(node);
				const highlighted = node == options.current || node == hovered;
				context.globalAlpha = isNear(node) ? 1 : 0.3;
				// a group colour stays, a ring marks the current and hovered page
				context.fillStyle =
					node.color ??
					(highlighted ? color("--graph-focus") : color("--graph-node"));
				context.beginPath();
				context.arc(point.x, point.y, radius(node), 0, 2 * Math.PI);
				context.fill();
				if (highlighted && undefined != node.color) {
					context.strokeStyle = color("--graph-focus");
					context.lineWidth = 2;
					context.beginPath();
					context.arc(point.x, point.y, radius(node) + 2.5, 0, 2 * Math.PI);
					context.stroke();
				}

				if (showAllLabels || highlighted) {
					context.font = `${highlighted ? 600 : 400} 10.5px ${font}`;
					context.fillStyle = color("--graph-text");
					context.textAlign = "center";
					context.fillText(
						this.shorten(node.name),
						Math.min(Math.max(point.x, 40), width - 40),
						point.y + radius(node) + 12,
					);
				}
			}
			context.globalAlpha = 1;
		};

		canvas.addEventListener("graph-resize", (event: CustomEvent) => {
			width = event.detail.width;
			height = event.detail.height;
			const ratio = window.devicePixelRatio || 1;
			canvas.width = width * ratio;
			canvas.height = height * ratio;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;

			// fit the graph, leaving room for the labels
			const padding = 28;
			const extentX = Math.max(...nodes.map((n) => Math.abs(n.x)), 1);
			const extentY = Math.max(...nodes.map((n) => Math.abs(n.y)), 1);
			fit = Math.min(
				(width / 2 - padding) / extentX,
				(height / 2 - padding) / extentY,
				4,
			);
			render();
		});

		const pointer = (event: MouseEvent) => {
			const bounds = canvas.getBoundingClientRect();
			return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
		};

		const nodeAt = (event: MouseEvent): GraphNode => {
			const { x, y } = pointer(event);
			return nodes.find((n) => {
				const point = toScreen(n);
				return Math.hypot(point.x - x, point.y - y) <= radius(n) + 5;
			});
		};

		let dragging = false;
		let dragged = false;
		let last = { x: 0, y: 0 };

		canvas.addEventListener("mousedown", (event) => {
			if (!options.interactive) return;
			dragging = true;
			dragged = false;
			last = pointer(event);
		});

		window.addEventListener("mouseup", () => (dragging = false));

		canvas.addEventListener("mousemove", (event) => {
			if (dragging) {
				const point = pointer(event);
				offsetX += point.x - last.x;
				offsetY += point.y - last.y;
				dragged ||= Math.hypot(point.x - last.x, point.y - last.y) > 2;
				last = point;
				render();
				return;
			}

			const node = nodeAt(event);
			if (node == hovered) return;
			hovered = node;
			canvas.style.cursor =
				undefined != node && node != options.current
					? "pointer"
					: options.interactive
						? "grab"
						: "default";
			canvas.title = node?.name ?? "";
			render();
		});

		canvas.addEventListener("mouseleave", () => {
			hovered = undefined;
			render();
		});

		canvas.addEventListener(
			"wheel",
			(event) => {
				if (!options.interactive) return;
				event.preventDefault();
				const { x, y } = pointer(event);
				const factor = Math.exp(-event.deltaY * 0.0008);
				const next = Math.min(Math.max(zoom * factor, 0.3), 6);

				// keep the point under the pointer in place
				const ratio = next / zoom;
				offsetX = (offsetX + width / 2 - x) * ratio + x - width / 2;
				offsetY = (offsetY + height / 2 - y) * ratio + y - height / 2;
				zoom = next;
				render();
			},
			{ passive: false },
		);

		canvas.addEventListener("click", (event) => {
			if (dragged) return;
			const node = nodeAt(event);
			if (undefined == node || node == options.current) return;
			location.href = PathService.getWikiViewRoute(node.route);
		});

		connectToSignal(THEME_CHANGED_SIGNAL, async () => render());
		document.fonts?.ready.then(render);
		return canvas;
	}

	/**
	 * The page name, a readme takes the name of its folder
	 */
	private static pageName(route: string): string {
		const sections = route.split("/");
		let name = sections.pop();
		if ("readme" == name && 0 < sections.length) name = sections.pop();
		return PathService.getPascalCase(PathService.decodeCustomUrl(name));
	}

	private static shorten(name: string): string {
		return name.length > 22 ? `${name.substring(0, 21)}…` : name;
	}
}
