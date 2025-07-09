/** Create a DOM element */
export function uiComponent(properties) {
    const element = document.createElement(properties.type || "div");
    element.innerHTML = undefined != properties.text ? properties.text : "";
    if (undefined != properties.id)
        element.id = properties.id;
    setDomClasses(element, properties.classes);
    setDomAttributes(element, properties.attributes);
    setDomStyles(element, properties.styles);
    setDomDataset(element, properties.data);
    if (false == properties.selectable) {
        setDomStyles(element, { userSelect: "none" });
    }
    return element;
}
/** Set DOM attributes */
export function setDomAttributes(element, attributes) {
    if (undefined == element || undefined == attributes)
        return element;
    for (const key in attributes)
        element.setAttribute(key, attributes[key]);
    return element;
}
/** Remove the DOM attributes */
export function removeDomAttributes(element, attributes) {
    if (undefined == element || undefined == attributes)
        return element;
    for (const attr of attributes)
        element.removeAttribute(attr);
    return element;
}
/** Set DOM classes */
export function setDomClasses(element, classes) {
    if (undefined == element || undefined == classes)
        return element;
    for (const cl of classes) {
        element.classList.add(cl);
    }
    return element;
}
/** Set DOM classes */
export function removeDomClasses(element, classes) {
    if (undefined == element || undefined == classes)
        return element;
    for (const cl of classes) {
        element.classList.remove(cl);
    }
    return element;
}
/** Set DOM styles */
export function setDomStyles(element, styles) {
    if (undefined == element || undefined == styles)
        return element;
    for (const key in styles)
        element.style[key] = styles[key];
    return element;
}
/** Remove DOM styles */
export function removeDomStyles(element, styles) {
    if (undefined == element || undefined == styles)
        return element;
    for (const style in styles)
        element.style.removeProperty(style);
    return element;
}
/** Set DOM events*/
export function setDomEvents(element, events) {
    if (undefined == element || undefined == events)
        return element;
    for (const key in events)
        element.addEventListener(key, events[key]);
    return element;
}
/** Remove DOM events */
export function removeDomEvents(element, events) {
    if (undefined == element || undefined == events)
        return element;
    for (const key in events)
        element.removeEventListener(key, events[key]);
    return element;
}
/** Set DOM dataset */
export function setDomDataset(element, dataset) {
    if (undefined == element || undefined == dataset)
        return element;
    for (const key in dataset)
        element.dataset[key] = dataset[key];
    return element;
}
/** Remove DOM dataset */
export function removeDomDataset(element, dataset) {
    if (undefined == element || undefined == dataset)
        return element;
    for (const data of dataset) {
        delete element.dataset[data];
    }
    return element;
}
/** Remove DOM element by selector */
export function removeDomById(id) {
    if (undefined == id)
        return;
    let element = document.getElementById(id);
    if (undefined == element)
        return;
    element.parentNode.removeChild(element);
}
/** Remove all DOM elements by query selector */
export function removeAllDomBySelector(selector) {
    if (undefined == selector)
        return 0;
    const elements = document.querySelectorAll(selector);
    if (undefined == elements)
        return 0;
    let count = 0;
    for (let element of elements) {
        element.parentNode.removeChild(element);
        count++;
    }
    return count;
}
