export class IndexItem {
	type: number;
	files: { [key: string]: IndexItem };
	path: string;
	/** position in its folder ("1-" prefix of its file), missing when it has none */
	order?: number;
}

/**
 * The names of the pages and folders of a folder, in reading order:
 * the numbered ones by their number, then the rest alphabetically
 */
export function orderedKeys(item: IndexItem): string[] {
	// 0 is a position (the first page), only a missing order goes last
	const position = (key: string) => item.files[key].order ?? Number.MAX_SAFE_INTEGER;
	return Object.keys(item.files ?? {}).sort(
		(a, b) => position(a) - position(b) || a.localeCompare(b),
	);
}

export enum ItemType {
	Directory = 1,
	File = 2,
}

export function getIndexItemFromRoute(
	index: IndexItem,
	route: string,
): IndexItem {
	const params = decodeURI(route).split("/");
	if (0 == params.length) return;

	let key = params.shift();
	let parent = index.files[key];
	if (ItemType.File == parent.type) return parent;

	while (undefined != parent || ItemType.Directory == parent.type) {
		key = params.shift();
		const item = parent.files[key];
		if (item == undefined) return parent;
		if (ItemType.File == item.type) return item;
		parent = item;
	}

	return;
}

function getIndexFromRouteParams() {}
