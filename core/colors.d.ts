/** Colours of an accent that read well on papiro's light and dark backgrounds */
export type AccentColours = {
    primary: string;
    soft: string;
};
/**
 * The accent for a theme: the soft tint for highlights, and the accent
 * itself darkened (light theme) or lightened (dark theme) only as much as
 * needed to read on every background and on the soft tint
 * @returns null when the accent is not a hex colour
 */
export declare function accentFor(accent: string, dark: boolean): AccentColours | null;
