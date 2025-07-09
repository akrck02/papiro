import { uiComponent } from "./dom.js";
const icons = new Map();
/**
 * Load icon collection from the given path
 * WARNING: Icon collection must be a json file
 * with svg contents for each key.
 *
 * @param id The id to set to the collection
 * @param path The path to search the collection for
 */
export async function loadIcons(id, path) {
    const collection = await fetch(path).then(res => res.json()).catch(console.error);
    icons.set(id, collection);
}
/**
 * Get an icon from current bundle
 * @param collectionId The id of the collection to search in
 * @param key The id of the icon to search for
 * @param size (Optional) The size to apply to the icon, applies 24px by default
 * @param fill (Optional) The color to fill the icon, applies #222222 by default
 * @returns HTMLElement with the svg element inside, nothing if the icon or collection does not exist
 */
export function getIcon(collectionId, key, size = "24px", fill = "#222222") {
    const collection = icons.get(collectionId);
    if (undefined == collection)
        return undefined;
    const content = collection[key];
    if (undefined == content)
        return undefined;
    const svg = `<svg height="${size}" width="${size}" viewBox="0 0 24 24" fill="${fill}">${content || ""}</svg>`;
    return uiComponent({ type: "div", text: svg });
}
