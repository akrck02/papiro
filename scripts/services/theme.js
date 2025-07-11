import { setConfiguration } from "../lib/configuration.js";
import { setDomDataset } from "../lib/dom.js";
import { emitSignal, setSignal } from "../lib/signals.js";
export const THEME_CHANGED_SIGNAL = setSignal();
export class Theme {
    static toggle() {
        if (document.documentElement.dataset.theme == "dark")
            this.setLight();
        else
            this.setDark();
        emitSignal(THEME_CHANGED_SIGNAL, {});
    }
    static setDark() {
        setDomDataset(document.documentElement, { theme: "dark" });
        setConfiguration("theme", "dark");
    }
    static setLight() {
        setDomDataset(document.documentElement, { theme: "light" });
        setConfiguration("theme", "light");
    }
    static isDark() {
        return document.documentElement.dataset["theme"] == "dark";
    }
}
