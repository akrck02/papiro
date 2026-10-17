/** The readable name of a route: its last section, capitalised, without an ordering number */
export function pageName(route: string): string {
	// "2-getting-started" sorts second and reads "Getting started"
	const name = route.substring(route.lastIndexOf("/") + 1).replace(/^\d+[-_ ]+(?=.)/, "").replaceAll("-", " ");
	return name.substring(0, 1).toUpperCase() + name.substring(1);
}

/** The name of a page for the graph: a readme takes the name of its folder */
export function graphName(route: string): string {
	const sections = route.split("/");
	let name = sections.pop();
	if ("readme" == name && 0 < sections.length) name = sections.pop();
	return pageName(name);
}
