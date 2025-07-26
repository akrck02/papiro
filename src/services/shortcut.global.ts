import Shortcuts, { Shortcut } from "../lib/shortcuts.js";

export default class GlobalShortcuts {
	private static readonly REGISTRY = Shortcuts.register(
		document.documentElement,
	);

	static set(shortcut: Shortcut) {
		Shortcuts.set(this.REGISTRY, shortcut);
	}
}
