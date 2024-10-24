import { EmbedBuilder, resolveColor } from "discord.js";

export default class NotEnoughEmbed extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public item: string,
        public amount: number,
        public extraDesc: string,
    ) {
        super({
            color: resolveColor(client.color.red),
            title: `Oops! Bạn chưa đủ [ ${item} ]`,
            description: `
            - Bạn còn thiếu **[ ${amount} ]**
            ${extraDesc}
            `,
        });
    }
}
