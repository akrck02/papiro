export declare class IndexItem {
    type: number;
    files: {
        [key: string]: IndexItem;
    };
    path: string;
    /** position in its folder ("1-" prefix of its file), missing when it has none */
    order?: number;
}
/**
 * The names of the pages and folders of a folder, in reading order:
 * the numbered ones by their number, then the rest alphabetically
 */
export declare function orderedKeys(item: IndexItem): string[];
export declare enum ItemType {
    Directory = 1,
    File = 2
}
export declare function getIndexItemFromRoute(index: IndexItem, route: string): IndexItem;
