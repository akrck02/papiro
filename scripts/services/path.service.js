import { getConfiguration } from "../lib/configuration.js";
import { AppConfigurations, PathConfigurations, } from "../model/enum/configurations.js";
class PathService {
    static getPascalCase(name) {
        return name.substring(0, 1).toUpperCase().concat(name.substring(1));
    }
    static getUrlWithoutLastSection(url) {
        return url.substring(0, url.lastIndexOf(this.URL_SEPARATOR));
    }
    static getWebUrl(appendix) {
        const webUrl = getConfiguration(AppConfigurations.WebUrl);
        return this.encodeCustomUrl(`${webUrl}/${appendix}`);
    }
    static getWikiViewRoute(appendix) {
        const webUrl = getConfiguration(AppConfigurations.WebUrl);
        return this.encodeCustomUrl(this.createUrl([webUrl, this.URL_HASH, this.WIKI_PATH, appendix]));
    }
    static getFullWikiResourcePath(appendix) {
        const wikiPath = getConfiguration(AppConfigurations.Path)[PathConfigurations.Wiki];
        return this.encodeCustomUrl(this.getWebUrl(this.createUrl([wikiPath, appendix])));
    }
    static createUrl(items) {
        return items.filter((i) => "" != i.trim()).join(this.URL_SEPARATOR);
    }
    static encodeCustomUrl(url) {
        return (url?.replaceAll(" ", this.URL_SPACE_SEPARATOR).toLocaleLowerCase() ?? "");
    }
    static decodeCustomUrl(url) {
        return (url?.replaceAll(this.URL_SPACE_SEPARATOR, " ").toLocaleLowerCase() ?? "");
    }
}
PathService.URL_SEPARATOR = "/";
PathService.URL_SPACE_SEPARATOR = "-";
PathService.URL_HASH = "#";
PathService.WIKI_PATH = "wiki";
export default PathService;
