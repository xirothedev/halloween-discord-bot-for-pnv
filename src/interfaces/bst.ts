import ranColor from "@/helpers/ranColor";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";
import type { FullUser } from "typings/command";

export default class BstInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: FullUser,
    ) {
        const vi = `<:pnv_diamond:1293649685566722140> ${bold("Ví")}\n> ${bold(`x${user.candy}`)} ${client.items.candy.icon}\n> ${bold(`x${user.premium_candy}`)} ${client.items.premium_candy.icon}\n> ${bold(`x${user.soul}`)} ${client.items.soul.icon}`;

        const progress = `<:pnv_global:1293649382809272445> ${bold("Tiến Trình Chung")}\n> - Tổng số card đã mở: \`${user.total_pack * 3}\`\n> - Tổng số card: \`${user.cards.length}/${client.cards.length}\`\n> - Số pack hoàn thành: \`${client.utils.getFinisedPack(user)}/${client.packs.length}\``;

        const finishedPack = `<:pnv_global:1293649382809272445> ${bold("Tiến Trình Card")}\n> - ${client.icons.b_rank} \`${user.cards.filter((f) => f.rank === "b_rank").length}/${client.cards.filter((f) => f.rank === "b_rank").length}\`\n> - ${client.icons.a_rank} \`${user.cards.filter((f) => f.rank === "a_rank").length}/${client.cards.filter((f) => f.rank === "a_rank").length}\`\n> - ${client.icons.r_rank} \`${user.cards.filter((f) => f.rank === "r_rank").length}/${client.cards.filter((f) => f.rank === "r_rank").length}\`\n> - ${client.icons.sr_rank} \`${user.cards.filter((f) => f.rank === "sr_rank").length}/${client.cards.filter((f) => f.rank === "sr_rank").length}\`\n> - ${client.icons.s_rank} \`${user.cards.filter((f) => f.rank === "s_rank").length}/${client.cards.filter((f) => f.rank === "s_rank").length}\``;

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
            description: vi + "\n" + progress + "\n" + finishedPack,
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });
    }
}

export class BaseBstCardInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: FullUser,
        public pack: {
            id: string;
            name: string;
            icon: string;
            cards: string[];
        },
    ) {
        const finishedCard = client.utils.getFinisedCard(user, pack.id);
        const packLine = `${pack.icon} ${bold(pack.name)}\n> - \`${finishedCard.cards.length}/${pack.cards.length}\``;
        const cardLine = `${pack.icon} ${bold("Card Hiện Có")}\n${finishedCard.cards
            .map((card) => {
                if (finishedCard.pack?.cards.includes(card.card_id)) {
                    return `> \`${card.card_id}\` • ${client.icons[card.rank]} • ${card.name}`;
                } else {
                    return `> \`${card.card_id}\` • ${client.icons[card.rank]} • ~~${card.name}~~`;
                }
            })
            .join("\n")}`;

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
            description: packLine + "\n" + cardLine,
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });
    }
}
