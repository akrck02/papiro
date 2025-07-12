import { BubbleUI } from "../lib/bubble.js";
import { getConfiguration } from "../lib/configuration.js";
import { uiComponent } from "../lib/dom.js";
import { Html } from "../lib/html.js";
import { AppConfigurations } from "../model/enum/configurations.js";
class Footer {
    static create() {
        const footer = uiComponent({
            type: Html.Footer,
            id: this.ID,
            classes: [BubbleUI.BoxRow, BubbleUI.BoxCenter],
        });
        const githubRepositoryLink = uiComponent({
            type: Html.A,
            text: getConfiguration(AppConfigurations.CoreName),
            attributes: {
                href: getConfiguration(AppConfigurations.GithubRepository),
            },
        });
        const text = uiComponent({
            type: Html.P,
            id: this.TEXT_ID,
            classes: [BubbleUI.TextCenter],
            text: `Powered by ${githubRepositoryLink.outerHTML} ${getConfiguration(AppConfigurations.CoreVersion)}, made with 🩵 by ${getConfiguration(AppConfigurations.Author)}`,
        });
        footer.appendChild(text);
        return footer;
    }
}
Footer.ID = "footer";
Footer.TEXT_ID = "text";
export default Footer;
