import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { connectToSignal } from "../lib/signals.js";
import PathService from "../service/path.service.js";
import { THEME_CHANGED_SIGNAL } from "../service/theme.js";
import { WikiGraph } from "../service/wiki.service.js";

type GraphNode = {
	route: string;
	name: string;
	links: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
};

type GraphEdge = { from: GraphNode; to: GraphNode };

/**
 * Local graph: the current page and the pages it links to or is linked from,
 * placed with a small force simulation and drawn on a canvas.
 */
export default class LocalGraph {
	static readonly CLASS = "local-graph";
	static readonly SIZE = 220;
	static readonly MIN_NODES = 6;
	static readonly MAX_NODES = 40;
	static readonly LABELS_UP_TO = 5;
	static readonly STEPS = 300;

	/**
	 * Create the local graph of a page
	 * @returns the component, or undefined if the page has no links
	 */
	static create(route: string, graph: WikiGraph): HTMLElement {
		const routes = this.neighbourhood(route, graph);
		if (routes.length < 2) return undefined;

		const linksOf = (r: string) =>
			(graph[r]?.length ?? 0) +
			Object.keys(graph).filter((k) => graph[k].includes(r)).length;

		// start on a circle so the result is the same on every visit
		const nodes: GraphNode[] = routes.map((r, i) => {
			const angle = (2 * Math.PI * i) / routes.length;
			const radius = 0 == i ? 0 : 60;
			return {
				route: r,
				name: this.pageName(r),
				links: linksOf(r),
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

		this.simulate(nodes, edges);
		return this.draw(nodes, edges);
	}

	/**
	 * The page, its neighbours, and their neighbours when there are few
	 */
	private static neighbourhood(route: string, graph: WikiGraph): string[] {
		if (undefined == graph[route]) return [];

		const neighbours = (r: string) => [
			...(graph[r] ?? []),
			...Object.keys(graph).filter((k) => graph[k].includes(r)),
		];

		const routes = [route];
		const add = (r: string) => {
			if (!routes.includes(r) && routes.length < this.MAX_NODES) routes.push(r);
		};

		neighbours(route).forEach(add);
		if (routes.length < this.MIN_NODES) {
			[...routes].forEach((r) => neighbours(r).forEach(add));
		}

		return routes;
	}

	/**
	 * Place the nodes: they push each other away, links pull like springs,
	 * and the current page stays in the middle
	 */
	private static simulate(nodes: GraphNode[], edges: GraphEdge[]) {
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
					const force = repulsion / distance2;
					const distance = Math.sqrt(distance2);
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

			// the current page is the anchor
			nodes[0].x = 0;
			nodes[0].y = 0;
		}
	}

	private static draw(nodes: GraphNode[], edges: GraphEdge[]): HTMLElement {
		const size = this.SIZE;
		const container = uiComponent({ classes: [this.CLASS] });
		container.appendChild(uiComponent({ type: Html.P, text: "Linked pages" }));

		const canvas = document.createElement("canvas");
		const ratio = window.devicePixelRatio || 1;
		canvas.width = size * ratio;
		canvas.height = size * ratio;
		canvas.style.width = `${size}px`;
		canvas.style.height = `${size}px`;
		container.appendChild(canvas);

		// fit the drawing in the canvas, leaving room for the labels
		const padding = 28;
		const extent = Math.max(
			...nodes.map((n) => Math.max(Math.abs(n.x), Math.abs(n.y))),
			1,
		);
		const scale = (size / 2 - padding) / extent;
		const toScreen = (n: GraphNode) => ({
			x: size / 2 + n.x * scale,
			y: size / 2 + n.y * scale,
		});
		const radius = (n: GraphNode, i: number) =>
			0 == i ? 6 : Math.min(2.5 + Math.sqrt(n.links), 6);

		let hovered: GraphNode = undefined;
		const context = canvas.getContext("2d");

		const render = () => {
			const style = getComputedStyle(document.documentElement);
			const color = (name: string) => style.getPropertyValue(name).trim();
			const font = color("--font") || "sans-serif";

			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			context.clearRect(0, 0, size, size);

			const isNear = (n: GraphNode) =>
				undefined == hovered ||
				n == hovered ||
				edges.some(
					(e) =>
						(e.from == hovered && e.to == n) || (e.to == hovered && e.from == n),
				);

			for (const edge of edges) {
				const from = toScreen(edge.from);
				const to = toScreen(edge.to);
				const active =
					undefined != hovered && (edge.from == hovered || edge.to == hovered);
				context.strokeStyle = active ? color("--primary-color") : color("--line");
				context.lineWidth = active ? 1.5 : 1;
				context.beginPath();
				context.moveTo(from.x, from.y);
				context.lineTo(to.x, to.y);
				context.stroke();
			}

			nodes.forEach((node, i) => {
				const point = toScreen(node);
				context.globalAlpha = isNear(node) ? 1 : 0.35;
				context.fillStyle =
					0 == i || node == hovered
						? color("--primary-color")
						: color("--text-faint");
				context.beginPath();
				context.arc(point.x, point.y, radius(node, i), 0, 2 * Math.PI);
				context.fill();

				const showLabel =
					node == hovered || 0 == i || nodes.length <= this.LABELS_UP_TO;
				if (showLabel) {
					context.font = `${0 == i || node == hovered ? 600 : 400} 10.5px ${font}`;
					context.fillStyle =
						node == hovered ? color("--text-color") : color("--text-soft");
					context.textAlign = "center";
					context.fillText(
						this.shorten(node.name),
						Math.min(Math.max(point.x, 40), size - 40),
						point.y + radius(node, i) + 12,
					);
				}
			});
			context.globalAlpha = 1;
		};

		const nodeAt = (event: MouseEvent): GraphNode => {
			const bounds = canvas.getBoundingClientRect();
			const x = event.clientX - bounds.left;
			const y = event.clientY - bounds.top;
			return nodes.find((n, i) => {
				const point = toScreen(n);
				return Math.hypot(point.x - x, point.y - y) <= radius(n, i) + 5;
			});
		};

		canvas.addEventListener("mousemove", (event) => {
			const node = nodeAt(event);
			if (node == hovered) return;
			hovered = node;
			canvas.style.cursor = undefined != node && node != nodes[0] ? "pointer" : "default";
			canvas.title = node?.name ?? "";
			render();
		});

		canvas.addEventListener("mouseleave", () => {
			hovered = undefined;
			render();
		});

		canvas.addEventListener("click", (event) => {
			const node = nodeAt(event);
			if (undefined == node || node == nodes[0]) return;
			location.href = PathService.getWikiViewRoute(node.route);
		});

		connectToSignal(THEME_CHANGED_SIGNAL, async () => render());
		document.fonts?.ready.then(render);
		render();
		return container;
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
