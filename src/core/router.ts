import { PapiroTarget } from "./types.js";

export interface Router {
	current(): PapiroTarget;
	href(target: PapiroTarget): string;
	navigate(target: PapiroTarget): void;
	/** call back on every change, returns the way to stop listening */
	listen(callback: (target: PapiroTarget) => void): () => void;
	/** links must be handled by papiro instead of the browser */
	readonly intercepts: boolean;
}

/**
 * Keeps the page in the address hash, under a prefix so the host app keeps
 * its own routes: "#/wiki/route", or "#/docs/wiki/route" with prefix "docs"
 */
export class HashRouter implements Router {
	readonly intercepts = false;
	private readonly prefix: string;

	/**
	 * @param prefix the section of the hash that belongs to papiro
	 * @param first where to start while the address belongs to the host app
	 */
	constructor(prefix: string, private readonly first: PapiroTarget) {
		this.prefix = prefix.replace(/^[#/]+|\/+$/g, "");
	}

	current(): PapiroTarget {
		return this.parse(location.hash) ?? this.first;
	}

	href(target: PapiroTarget): string {
		const base = "" == this.prefix ? "#" : `#/${this.prefix}`;
		switch (target.view) {
			case "page":
				return `${base}/wiki/${target.route}`;
			case "graph":
				return `${base}/graph`;
			default:
				return `${base}/`;
		}
	}

	navigate(target: PapiroTarget) {
		location.hash = this.href(target).substring(1);
	}

	listen(callback: (target: PapiroTarget) => void): () => void {
		const listener = () => {
			const target = this.parse(location.hash);
			if (null != target) callback(target);
		};
		window.addEventListener("hashchange", listener);
		return () => window.removeEventListener("hashchange", listener);
	}

	/** the target of a hash, null when it belongs to the host app */
	private parse(hash: string): PapiroTarget | null {
		let sections = decodeURI(hash.replace(/^#/, ""))
			.toLowerCase()
			.split("/")
			.filter((section) => "" != section);

		if ("" != this.prefix) {
			if (sections[0] != this.prefix.toLowerCase()) return null;
			sections = sections.slice(1);
		}

		if (0 == sections.length) return { view: "home" };
		if ("wiki" == sections[0])
			return { view: "page", route: sections.slice(1).join("/") };
		if ("graph" == sections[0] && 1 == sections.length) return { view: "graph" };
		return { view: "not-found" };
	}
}

/** Keeps the page inside the instance, the address is never touched */
export class MemoryRouter implements Router {
	readonly intercepts = true;
	private target: PapiroTarget;
	private callbacks: ((target: PapiroTarget) => void)[] = [];

	constructor(first: PapiroTarget) {
		this.target = first;
	}

	current(): PapiroTarget {
		return this.target;
	}

	href(_: PapiroTarget): string {
		return "#";
	}

	navigate(target: PapiroTarget) {
		this.target = target;
		this.callbacks.forEach((callback) => callback(target));
	}

	listen(callback: (target: PapiroTarget) => void): () => void {
		this.callbacks.push(callback);
		return () => {
			this.callbacks = this.callbacks.filter((c) => c != callback);
		};
	}
}
