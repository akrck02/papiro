export class IndexItem {
}
export var ItemType;
(function (ItemType) {
    ItemType[ItemType["Directory"] = 1] = "Directory";
    ItemType[ItemType["File"] = 2] = "File";
})(ItemType || (ItemType = {}));
export function getIndexItemFromRoute(index, route) {
    const params = route.split("/");
    if (0 == params.length)
        return;
    let key = params.shift();
    let parent = index[key];
    if (ItemType.File == parent.type)
        return parent;
    while (undefined != parent || ItemType.Directory == parent.type) {
        key = params.shift();
        const item = parent.files[key];
        if (item == undefined)
            return parent;
        if (ItemType.File == item.type)
            return item;
        parent = item;
    }
    return;
}
function getIndexFromRouteParams() { }
