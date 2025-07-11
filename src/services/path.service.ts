import { getConfiguration } from "../lib/configuration.js";

export default class PathService {
	static getWebUrl(appendix: string) {
		return this.encodeCustomUrl(
			`${getConfiguration("base")["web_url"]}/${appendix}`.toLocaleLowerCase(),
		);
	}

	static getRoute(appendix: string): string {
		return this.getWebUrl(`#/${appendix}`);
	}

	static getWikiViewRoute(appendix: string, full = false): string {
		return this.encodeCustomUrl(
			`${full ? getConfiguration("base")["web_url"] + "/#/" : ""}${getConfiguration("views")["wiki"]}/${appendix}`.toLocaleLowerCase(),
		);
	}

	static getPascalCase(name: string): string {
		return name.substring(0, 1).toUpperCase().concat(name.substring(1));
	}

	static getFullWikiPath(subPath: string, appendix: string): string {
		return this.encodeCustomUrl(
			this.getWebUrl(
				`${getConfiguration("path")["wiki"]}/${subPath.substring(0, subPath.lastIndexOf("/"))}/${appendix}`,
			),
		);
	}

	static encodeCustomUrl(url: string): string {
		return url?.replaceAll(" ", "-") ?? "";
	}

	static decodeCustomUrl(url: string): string {
		return url?.replaceAll("-", " ") ?? "";
	}
}
