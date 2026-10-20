# Embed papiro in a web app 🧩
---

Papiro is also a library: it shows a wiki made by the papiro indexer inside any element of a page, for example the help of a web app. Every instance keeps its own pages, address and theme, and nothing outside its element is touched.

## Add the library

Take `papiro.js` and `papiro.css` from the [latest release](https://github.com/akrck02/papiro/releases/latest), or use them from jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/akrck02/papiro@lib/papiro.css" />
<script type="module">
  import { createPapiro } from "https://cdn.jsdelivr.net/gh/akrck02/papiro@lib/papiro.js";
</script>
```

`papiro.js` is an ES module with no dependencies.

### From TypeScript

`papiro-lib.tar.gz` in the release (or the `lib` branch) has `papiro.js`, `papiro.css` and the type declarations (`papiro.d.ts` and its folders). Copy them into your project, for example in `src/lib/papiro/`, and import them as any module:

```ts
import { createPapiro, type Papiro, type PapiroOptions } from "./lib/papiro/papiro.js";

const options: PapiroOptions = { source: "/wiki", layout: "page", route: "guides/settings" };
const help: Papiro = await createPapiro("#help", options);
```

Options, layouts, themes and targets are typed, so a wrong value is a compile error.

## Show a wiki

The wiki is the folder written by the papiro indexer (`index.json`, the pages and their files). Give its url as `source`; the instance takes the whole element, so give the element a size.

```ts
import { createPapiro } from "./papiro.js";

const docs = await createPapiro("#docs", {
  source: "https://example.org/wiki",
  title: "Docs",
  hashPrefix: "docs", // the address is #/docs/wiki/…, the rest of the hash is the app's
});
```

## Layouts

| layout | shows | routing by default |
| --- | --- | --- |
| `wiki` | bar, menu, search, pages and graph | `hash` |
| `page` | only the pages, from `route`: help for one screen | `memory` |
| `graph` | only the graph of the wiki | `memory` |

```ts
// the help of a screen, links between pages still work
const help = await createPapiro("#help", { source, layout: "page", route: "guides/settings" });

// a graph; the app decides what to do with the chosen page
await createPapiro("#map", {
  source,
  layout: "graph",
  onNavigate: (target) => {
    if ("page" == target.view) help.navigate(target);
  },
});
```

## Routing

- `hash`: the page is in the address, under `hashPrefix` (`#/docs/wiki/guides/settings`), so it can be shared and the back button works. Hashes outside the prefix belong to the app and are ignored.
- `memory`: the instance keeps the page and never touches the address.

## Options

| option | default | what it does |
| --- | --- | --- |
| `source` | | url of the indexed wiki |
| `layout` | `wiki` | `wiki`, `page` or `graph` |
| `routing` | by layout | `hash` or `memory` |
| `hashPrefix` | `""` | the section of the hash that belongs to papiro |
| `route` | `""` | first page with memory routing, `""` is the first page |
| `title`, `description`, `logo` | | the wiki name, its description and an svg logo url |
| `theme` | `auto` | `auto` follows the system, or `light`, `dark` |
| `accent` | papiro's ochre | the project's colour (`"#2BB3A3"`), adjusted for each theme so text reads well |
| `font` | `system` | `system`, or `papiro` for its reading fonts |
| `width` | `normal` | `normal` keeps a reading column, `wide` lets the pages take the whole width; readers switch it from the bar |
| `bar`, `menu`, `search`, `graph`, `breadcrumb` | by layout | show or hide each part |
| `startPage` | `false` | a start page with the title and description |
| `footer` | `false` | `true` for the papiro credits, or html |
| `shortcuts` | `false` | `Ctrl K` opens the search, `Shift T` switches the theme |
| `onNavigate`, `onThemeChange`, `onFontChange` | | called on each change, for example to remember the theme |

## The instance

```ts
docs.navigate("guides/settings");  // or { view: "graph" }
docs.setTheme("dark");             // "light", "dark" or "auto"
docs.setFont("papiro");
docs.openSearch();
docs.destroy();                    // removes it and stops listening
```

## Colours and fonts

The simplest way to give papiro the colour of a project is the `accent` option: one colour, and papiro works out a variant that reads at 4.5:1 or more on the light and the dark theme, and the soft tint of highlights.

Every style lives under the `.papiro` class, and it uses css variables that the app can change, for each theme:

```css
.papiro[data-theme="light"] { --primary-color: #2f6fd6; }
.papiro[data-theme="dark"] { --primary-color: #8ab4ff; }
.papiro { --font: "My font", sans-serif; --radius: 4px; }
```

Some of them: `--background`, `--surface-1`, `--surface-2`, `--text-color`, `--text-soft`, `--line`, `--primary-color`, `--primary-soft`, `--font`, `--font-reading`, `--font-console`, `--radius`, the `--code-*` colours and the `--graph-*` colours.

The layout follows the width of the element, not of the window: in a narrow element the bar goes to the bottom and the menu becomes a drawer.

> [Example with three instances in one page](https://github.com/akrck02/papiro/blob/main/examples/embed.html)
