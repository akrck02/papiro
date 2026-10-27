import Papiro from "../core/papiro.js";
/**
 * The html of a page, as papiro-indexer wrote it: internal links go through
 * the instance router, images and files come from the wiki folder
 */
export default class Content {
    /**
     * @param folder the folder of the page in the wiki, relative addresses
     * that papiro-indexer did not resolve are taken from it
     */
    static create(papiro: Papiro, html: string, folder?: string): HTMLElement;
    private static prepare;
    /** "#id" links scroll to their section inside the page */
    private static prepareSections;
    /** "./route" is a page, "./file.pdf" a file of the wiki, "#id" a section */
    private static prepareLink;
    /**
     * The address of a file of the wiki: "./x" comes from the root (papiro-indexer
     * resolved it), other relative addresses from the folder of the page.
     * Absolute addresses, data: and blob: urls are kept.
     */
    private static fileUrl;
    private static prepareSrcset;
    private static prepareImage;
    /** quotes starting with a bold title are callouts (the obsidian indexer writes them that way) */
    private static prepareCallout;
    /** the language of a code block and a button to copy it */
    private static prepareCode;
}
