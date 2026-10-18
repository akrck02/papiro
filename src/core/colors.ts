/** Colours of an accent that read well on papiro's light and dark backgrounds */

type Rgb = [number, number, number];

const LIGHT = { backgrounds: ["#f7f5f0", "#fdfcf9", "#f0ede6"], base: "#fdfcf9", towards: "#000000" };
const DARK = { backgrounds: ["#171716", "#1c1c1a", "#1f1f1d"], base: "#171716", towards: "#ffffff" };

/** text must read at 4.5:1 at least (WCAG AA) */
const MIN_CONTRAST = 4.5;

function parse(hex: string): Rgb | null {
	const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
	if (null == match) return null;
	let value = match[1];
	if (3 == value.length) value = [...value].map((c) => c + c).join("");
	return [0, 2, 4].map((i) => parseInt(value.substring(i, i + 2), 16)) as Rgb;
}

function hex(rgb: Rgb): string {
	return "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

/** a mixed with b: amount 0 is a, 1 is b */
function mix(a: Rgb, b: Rgb, amount: number): Rgb {
	return a.map((c, i) => c + (b[i] - c) * amount) as Rgb;
}

function luminance(rgb: Rgb): number {
	const [r, g, b] = rgb.map((c) => {
		const v = c / 255;
		return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
}

export type AccentColours = { primary: string; soft: string };

/**
 * The accent for a theme: the soft tint for highlights, and the accent
 * itself darkened (light theme) or lightened (dark theme) only as much as
 * needed to read on every background and on the soft tint
 * @returns null when the accent is not a hex colour
 */
export function accentFor(accent: string, dark: boolean): AccentColours | null {
	const colour = parse(accent);
	if (null == colour) return null;

	const theme = dark ? DARK : LIGHT;
	const soft = mix(parse(theme.base), colour, dark ? 0.22 : 0.16);
	const backgrounds = [...theme.backgrounds.map(parse), soft];

	let primary = colour;
	for (let step = 1; step <= 20; step++) {
		if (backgrounds.every((background) => contrast(primary, background) >= MIN_CONTRAST)) break;
		primary = mix(colour, parse(theme.towards), step * 0.05);
	}

	return { primary: hex(primary), soft: hex(soft) };
}
