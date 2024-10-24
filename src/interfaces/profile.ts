import ranColor from "@/helpers/ranColor";
import { EmbedBuilder, Message, resolveColor } from "discord.js";
import type { FullUser } from "typings/command";

export default class ProfileInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: FullUser,
    ) {
        const author = client.users.cache.get(user.user_id)
        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: `Profile của ${author?.username}`,
                icon_url: message.guild?.iconURL()!,
            },
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });
    }
}
