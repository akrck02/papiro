type Shortcut = {
	key: string;
	ctrlKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
	callback: () => void;
};

export default class Shortcuts {
	static readonly registry: Map<string, Shortcut> = new Map();

	/**
	 * Start keyboard service
	 */
	static start() {
		document.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.repeat) return;

			const target = event.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			const action = this.getShortcutAction(event);
			this.execute(action);
		});
	}

	/**
	 * Get action if shortcut is registered or null
	 * @param event the keyboard event
	 * @returns the related action
	 */
	private static getShortcutAction(event: KeyboardEvent): Shortcut {
		return this.registry.get(this.getEventKeys(event));
	}

	/**
	 * Get event as key string
	 * @param event the keyboard event
	 * @returns event as key string
	 */
	private static getEventKeys(event: KeyboardEvent): string {
		const parts: string[] = [];
		if (event.ctrlKey) parts.push("Ctrl");
		if (event.shiftKey) parts.push("Shift");
		if (event.altKey) parts.push("Alt");
		if (event.metaKey) parts.push("Meta"); // Para Cmd en Mac

		if (!["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
			parts.push(event.key.toUpperCase());
		}
		return parts.join("+");
	}

	/**
	 * Get shortcut as key string
	 * @param shortcut the shortcut
	 * @returns shortcut as key string
	 */
	private static getShortcutKeys(shortcut: Shortcut): string {
		const parts: string[] = [];
		if (shortcut.ctrlKey) parts.push("Ctrl");
		if (shortcut.shiftKey) parts.push("Shift");
		if (shortcut.altKey) parts.push("Alt");
		if (shortcut.metaKey) parts.push("Meta");
		parts.push(shortcut.key.toUpperCase());
		return parts.join("+");
	}

	/**
	 * Execute a shotcut action
	 * @param action the action
	 */
	private static execute(action: Shortcut) {
		if (undefined == action || undefined == action.callback) return;

		action.callback();
	}

	/**
	 * Set a new action for a shortcut
	 * @param shortcut the shortcut
	 */
	static set(shortcut: Shortcut) {
		this.registry.set(this.getShortcutKeys(shortcut), shortcut);
	}
}
