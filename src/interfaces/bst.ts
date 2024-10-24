import ranColor from "@/helpers/ranColor";
import type { Card, Rank } from "@prisma/client";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";
import type { Pack } from "typings";
import type { FullUser } from "typings/command";

export default class BstInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: FullUser,
    ) {
        // Call super first
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
            description: "", // Set a default description
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });

        // Build the embed after calling super
        const vi = this.buildWalletInfo(client, user);
        const progress = this.buildProgressInfo(client, user);
        const finishedPack = this.buildFinishedPackInfo(client, user);

        // Set the description after the super call
        this.setDescription(`${vi}\n${progress}\n${finishedPack}`);
    }

    private buildWalletInfo(client: ExtendedClient, user: FullUser): string {
        const packsInfo = client.packs
            .map((p) => {
                const pack = user.packs.find((f) => f.pack_id === p.id);
                return `> ${bold(`x${pack?.quantity || 0}`)} ${p.icon}`;
            })
            .join("\n");

        return `
            <:pnv_diamond:1293649685566722140> ${bold("Ví")}
            > ${bold(`x${user.candy}`)} ${client.items.candy.icon}
            > ${bold(`x${user.premium_candy}`)} ${client.items.premium_candy.icon}
            > ${bold(`x${user.soul}`)} ${client.items.soul.icon}
            ${packsInfo}
            > ${bold(`x${user.soul_box}`)} ${client.items.soul_box.icon}
        `;
    }

    private buildProgressInfo(client: ExtendedClient, user: FullUser): string {
        const totalCards = user.total_pack * 3;
        const completedPacks = client.utils.getFinisedPack(user);
        const totalCardsCollected = `${user.cards.length}/${client.cards.length}`;

        return `
            <:pnv_global:1293649382809272445> ${bold("Tiến Trình Chung")}
            > - Tổng số card đã mở: \`${totalCards}\`
            > - Tổng số card: \`${totalCardsCollected}\`
            > - Số pack hoàn thành: \`${completedPacks}/${client.packs.length}\`
        `;
    }

    private buildFinishedPackInfo(client: ExtendedClient, user: FullUser): string {
        const ranks: Rank[] = ["b_rank", "a_rank", "r_rank", "sr_rank", "s_rank"];
        const rankProgress = ranks
            .map((rank) => {
                const userRankCount = user.cards.filter((f) => f.rank === rank).length;
                const totalRankCount = client.cards.filter((f) => f.rank === rank).length;
                return `> - ${client.icons[rank]} \`${userRankCount}/${totalRankCount}\``;
            })
            .join("\n");

        return `
            <:pnv_global:1293649382809272445> ${bold("Tiến Trình Card")}
            ${rankProgress}
        `;
    }
}

export class BaseBstCardInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: FullUser,
        public pack: Pack,
    ) {
        super({
            color: resolveColor(pack.color),
            author: {
                name: `Bộ Sưu Tập Của ${message.author.username}`,
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
        // Call super first
        const finishedCard = client.utils.getFinisedCard(user, pack.id);
        const packLine = `${pack.icon} ${bold(pack.name)}\n> - \`${finishedCard.cards.length}/${pack.cards.length}\``;
        const cardLine = this.buildCardInfo(client, user, pack, finishedCard);
        this.setDescription(`${packLine}\n\n${cardLine}`);
    }

    private buildCardInfo(client: ExtendedClient, user: FullUser, pack: Pack, finishedCard: { cards: Card[] }): string {
        return `${pack.icon} ${bold("Card Hiện Có")}\n${client.cards
            .filter((card) => card.topic === pack.id)
            .map((card) => {
                const isOwned = finishedCard.cards.find((f) => f.card_id === card.id);
                const cardStatus = isOwned ? card.name : `~~${card.name}~~`;
                return `> \`${card.id}\` • ${client.icons[card.rank as Rank]} • ${cardStatus} (${isOwned?.quantity || 0})`;
            })
            .join("\n")}`;
    }

    private buildPackInfo(pack: Pack, finishedCard: any): string {
        return `${pack.icon} ${bold(pack.name)}\n> - \`${finishedCard.cards.length}/${pack.cards.length}\``;
    }
}
