import { getConfiguration } from "../lib/configuration.js";

export default class PathService {
  static getWebUrl(appendix: string) {
    return `${getConfiguration("base")["web_url"]}/${appendix}`.toLocaleLowerCase();
  }

  static getRoute(appendix: string): string {
    return this.getWebUrl(`#/${appendix}`);
  }

  static getWikiViewRoute(appendix: string): string {
    return `${getConfiguration("views")["wiki"]}/${appendix}`.toLocaleLowerCase();
  }

  static getPascalCase(name: string): string {
    return name.substring(0, 1).toUpperCase().concat(name.substring(1));
  }

  static getFullWikiPath(subPath: string, appendix: string): string {
    return this.getWebUrl(
      `${getConfiguration("path")["wiki"]}/${subPath.substring(0, subPath.lastIndexOf("/"))}/${appendix}`,
    );
  }
}
