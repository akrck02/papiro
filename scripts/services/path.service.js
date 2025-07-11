import { getConfiguration } from "../lib/configuration.js";
export default class PathService {
    static getWebUrl(appendix) {
        return `${getConfiguration("base")["web_url"]}/${appendix}`.toLocaleLowerCase();
    }
    static getRoute(appendix) {
        return this.getWebUrl(`#/${appendix}`);
    }
    static getWikiViewRoute(appendix) {
        return `${getConfiguration("views")["wiki"]}/${appendix}`.toLocaleLowerCase();
    }
    static getPascalCase(name) {
        return name.substring(0, 1).toUpperCase().concat(name.substring(1));
    }
    static getFullWikiPath(subPath, appendix) {
        return this.getWebUrl(`${getConfiguration("path")["wiki"]}/${subPath.substring(0, subPath.lastIndexOf("/"))}/${appendix}`);
    }
}
