/**
 * Papiro as a library: show a wiki made by papiro-indexer inside any page.
 *
 *   import { createPapiro } from "papiro.js"
 *   const docs = await createPapiro("#docs", { source: "https://example.org/wiki" })
 */
import Papiro from "./core/papiro.js";
import { PapiroOptions } from "./core/types.js";

export { Papiro };
export type {
	PapiroFont,
	PapiroLayout,
	PapiroOptions,
	PapiroTarget,
	PapiroTheme,
	PapiroWidth,
} from "./core/types.js";

/**
 * Show a wiki inside an element
 * @param element the element, or a css selector
 * @param options the folder of the wiki and how to show it
 */
export function createPapiro(element: HTMLElement | string, options: PapiroOptions): Promise<Papiro> {
	const target = "string" == typeof element ? document.querySelector<HTMLElement>(element) : element;
	if (null == target) throw new Error(`papiro: no element for ${element}`);
	return Papiro.create(target, options);
}
