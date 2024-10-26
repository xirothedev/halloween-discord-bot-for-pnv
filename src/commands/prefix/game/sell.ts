import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { Category } from "typings/utils";
import items from "@/data/items.json";
import { Rank } from "@prisma/client";
import { EmbedBuilder } from "@discordjs/builders";
import ranColor from "@/helpers/ranColor";
import { resolveColor } from "discord.js";

export default prefix(
    "sell",
    {
        description: {
            content: `Bán thẻ lấy ${items.candy.icon}. Bạn có thể bán tất cả các thẻ hoặc thẻ theo hạng.`,
            examples: ["sell all", "sell b", "sell a", "sell r", "sell sr", "sell s"],
            usage: "sell <all | b | a | r | sr | s>",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const rankArg = args[0]?.toLowerCase();

        let ranksToSell: Rank[];
        switch (rankArg) {
            case "b":
                ranksToSell = [Rank.b_rank];
                break;
            case "a":
                ranksToSell = [Rank.a_rank];
                break;
            case "r":
                ranksToSell = [Rank.r_rank];
                break;
            case "sr":
                ranksToSell = [Rank.sr_rank];
                break;
            case "s":
                ranksToSell = [Rank.s_rank];
                break;
            case "all":
                ranksToSell = [Rank.b_rank, Rank.a_rank, Rank.r_rank, Rank.sr_rank, Rank.s_rank];
                break;
            default:
                return message.channel.send({
                    embeds: [
                        new ErrorInterface(client).setDescription(
                            "Lệnh không hợp lệ, hãy chọn all, b, a, r, sr hoặc s.",
                        ),
                    ],
                });
        }

        // Fetch user's cards based on selected ranks
        const cardsToSell = user.cards.filter((card) => ranksToSell.includes(card.rank));

        if (cardsToSell.length === 0) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có thẻ nào để bán thuộc loại này.")],
            });
        }

        const candyRates = {
            s_rank: 5,
            sr_rank: 4,
            r_rank: 3,
            a_rank: 2,
            b_rank: 1,
        };

        let totalS = 0;
        let totalSR = 0;
        let totalR = 0;
        let totalA = 0;
        let totalB = 0;

        let totalCandyEarned = 0;
        for (const card of cardsToSell) {
            const candyPerCard = candyRates[card.rank];
            totalCandyEarned += card.quantity * candyPerCard;

            switch (card.rank) {
                case "s_rank":
                    totalS += card.quantity;
                    break;
                case "sr_rank":
                    totalSR += card.quantity;
                    break;
                case "r_rank":
                    totalR += card.quantity;
                    break;
                case "a_rank":
                    totalA += card.quantity;
                    break;
                case "b_rank":
                    totalB += card.quantity;
                    break;
                default:
                    break;
            }

            await client.prisma.card.updateMany({
                where: { user_id: user.user_id, card_id: card.card_id },
                data: { quantity: 0 },
            });
        }

        // Cập nhật số kẹo cho người dùng
        await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: { candy: { increment: totalCandyEarned } },
        });

        const sold = [];
        if (totalS > 0) {
            sold.push(`**x${totalS} ${client.icons.s_rank}**`);
        }
        if (totalSR > 0) {
            sold.push(`**x${totalSR} ${client.icons.sr_rank}**`);
        }
        if (totalR > 0) {
            sold.push(`**x${totalR} ${client.icons.r_rank}**`);
        }
        if (totalA > 0) {
            sold.push(`**x${totalA} ${client.icons.a_rank}**`);
        }
        if (totalB > 0) {
            sold.push(`**x${totalB} ${client.icons.b_rank}**`);
        }

        if (client.logQuestChannel?.isSendable()) {
            client.logQuestChannel.send(
                `${message.author.username} đã bán thành công ${sold.join(", ")} và nhận được **x${totalCandyEarned}** ${client.items.candy.icon}`,
            );
        }

        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(resolveColor(ranColor(client.colors.main)))
                    .setDescription(
                        `Bạn đã bán thành công ${sold.join(", ")} và nhận được **x${totalCandyEarned}** ${client.items.candy.icon}`,
                    )
                    .setFooter({
                        text: `@${message.author.username} • .gg/phonguoiviet`,
                        iconURL: message.author.displayAvatarURL(),
                    }),
            ],
        });
    },
);
