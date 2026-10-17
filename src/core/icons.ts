import collection from "../../resources/icons/materialicons.json";

export type IconName = keyof typeof collection;

/** An svg icon of the bundled set, as html */
export function icon(name: IconName, size: number = 20): string {
	const content = (collection as { [key: string]: string })[name] ?? "";
	return `<svg class="papiro-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${content}</svg>`;
}
