export class IndexItem {
	type: number;
	files: { [key: string]: IndexItem };
	path: string;
}

export type Index = { [key: string]: IndexItem };

export enum ItemType {
	Directory = 1,
	File = 2,
}

export function getIndexItemFromRoute(index: Index, route: string): IndexItem {
	const params = decodeURI(route).split("/");
	if (0 == params.length) return;

	let key = params.shift();
	let parent = index[key];
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
