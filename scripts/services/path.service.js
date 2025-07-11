import { getConfiguration } from "../lib/configuration.js";
export default class PathService {
    static getWebUrl(appendix) {
        return this.encodeCustomUrl(`${getConfiguration("base")["web_url"]}/${appendix}`.toLocaleLowerCase());
    }
    static getRoute(appendix) {
        return this.getWebUrl(`#/${appendix}`);
    }
    static getWikiViewRoute(appendix, full = false) {
        return this.encodeCustomUrl(`${full ? getConfiguration("base")["web_url"] + "/#/" : ""}${getConfiguration("views")["wiki"]}/${appendix}`.toLocaleLowerCase());
    }
    static getPascalCase(name) {
        return name.substring(0, 1).toUpperCase().concat(name.substring(1));
    }
    static getFullWikiPath(subPath, appendix) {
        return this.encodeCustomUrl(this.getWebUrl(`${getConfiguration("path")["wiki"]}/${subPath.substring(0, subPath.lastIndexOf("/"))}/${appendix}`));
    }
    static encodeCustomUrl(url) {
        return url?.replaceAll(" ", "-") ?? "";
    }
    static decodeCustomUrl(url) {
        return url?.replaceAll("-", " ") ?? "";
    }
}
