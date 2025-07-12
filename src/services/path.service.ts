import { getConfiguration } from "../lib/configuration.js";
import {
	AppConfigurations,
	PathConfigurations,
} from "../model/enum/configurations.js";

export default class PathService {
	static URL_SEPARATOR = "/";
	static URL_SPACE_SEPARATOR = "-";
	static URL_HASH = "#";
	static WIKI_PATH = "wiki";

	static getPascalCase(name: string): string {
		return name.substring(0, 1).toUpperCase().concat(name.substring(1));
	}

	static getUrlWithoutLastSection(url: string): string {
		return url.substring(0, url.lastIndexOf(this.URL_SEPARATOR));
	}

	static getWebUrl(appendix: string) {
		const webUrl = getConfiguration(AppConfigurations.WebUrl);
		return this.encodeCustomUrl(`${webUrl}/${appendix}`);
	}

	static getWikiViewRoute(appendix: string): string {
		const webUrl = getConfiguration(AppConfigurations.WebUrl);
		return this.encodeCustomUrl(
			this.createUrl([webUrl, this.URL_HASH, this.WIKI_PATH, appendix]),
		);
	}

	static getFullWikiResourcePath(appendix: string): string {
		const wikiPath = getConfiguration(AppConfigurations.Path)[
			PathConfigurations.Wiki
		];
		return this.encodeCustomUrl(
			this.getWebUrl(this.createUrl([wikiPath, appendix])),
		);
	}

	static createUrl(items: string[]): string {
		return items.filter((i) => "" != i.trim()).join(this.URL_SEPARATOR);
	}

	static encodeCustomUrl(url: string): string {
		return (
			url?.replaceAll(" ", this.URL_SPACE_SEPARATOR).toLocaleLowerCase() ?? ""
		);
	}

	static decodeCustomUrl(url: string): string {
		return (
			url?.replaceAll(this.URL_SPACE_SEPARATOR, " ").toLocaleLowerCase() ?? ""
		);
	}
}
