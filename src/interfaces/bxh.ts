import ranColor from "@/helpers/ranColor";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";

export default class BxhInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public ranks: string[],
    ) {
        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: `Bảng xếp hạng ${message.guild?.name}`,
                icon_url: message.guild?.iconURL()!,
            },
            description: `${bold("Xếp hạng của bạn:")}\n\n${ranks.join("\n")}`,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: {
                url: "https://cdn-icons-png.flaticon.com/512/8358/8358032.png",
            },
        });
    }
}

export class BaseBxhInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public datas: string[],
    ) {
        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: `Bộ Sưu Tập Của ${message.author.username}`,
                icon_url: message.guild?.iconURL()!,
            },
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            description: datas.join("\n"),
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });
    }
}
