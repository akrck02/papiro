import Papiro from "../core/papiro.js";
/**
 * Search palette: pages by name, arrows to move, Enter to open, Esc to close
 */
export default class Search {
    private readonly papiro;
    readonly element: HTMLElement;
    private readonly input;
    private readonly results;
    private items;
    private selected;
    private index;
    private loading;
    constructor(papiro: Papiro);
    open(): void;
    close(): void;
    toggle(): void;
    private onKey;
    private search;
    static readonly MAX_RESULTS = 40;
    private allPages;
    /**
     * Pages whose name, title, sections or text have the query, best first:
     * the name, then the title, a section, and the text with a snippet
     */
    private find;
    private titleOf;
    /** one selection, shared by the keyboard and the mouse */
    private select;
}
