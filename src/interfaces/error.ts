import { EmbedBuilder, Message, resolveColor } from "discord.js";

export default class ErrorInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
    ) {
        super({
            color: resolveColor(client.color.red),
        });
    }
}
