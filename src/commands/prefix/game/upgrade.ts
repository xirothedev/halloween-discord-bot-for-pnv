import claimQuest from "@/functions/claimQuest";
import getIngredient from "@/functions/getIngredient";
import { getPower } from "@/functions/power";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { bold } from "discord.js";
import { Category } from "typings/utils";
import items from "@/data/items.json";

export default prefix(
    "upgrade",
    {
        description: {
            content: `nâng cấp sức mạnh card của bạn, tốn ${items.candy.icon} và ${items.soul.icon}.`,
            examples: ["upgrade t1"],
            usage: "upgrade <id/tên card>",
        },
        aliases: ["upg", "levelup"],
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        if (!args[0]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp id vật phẩm")],
            });
        }

        const card = user.cards.find(
            (f) => f.card_id === args[0] || f.name.toLowerCase() === args.join(" ").toLowerCase(),
        );

        if (!card) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy thẻ")],
            });
        }

        const ingredient = getIngredient(card.level);

        if (ingredient.candy > user.candy) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.candy.icon)],
            });
        }

        if (ingredient.soul > user.soul) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.soul.icon)],
            });
        }

        const data = await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                candy: { decrement: ingredient.candy },
                soul: { increment: ingredient.soul },
                cards: {
                    update: {
                        where: { card_id_user_id: { card_id: card.card_id, user_id: user.user_id } },
                        data: { level: { increment: 1 } },
                    },
                },
                quests: {
                    updateMany: {
                        where: { function: "upgrade_card", claimed: false },
                        data: { progress: { increment: 1 } },
                    },
                },
            },
            include: { quests: true },
        });

        const finishedQuest = data.quests.find((f) => f.function === "upgrade_card" && f.progress >= f.target);

        if (finishedQuest) {
            await claimQuest(client, user, finishedQuest);
        }

        const content = [
            `> - Nâng cấp ${client.icons[card.rank]} • ${bold(card.name)}`,
            `> - Cấp \`${card.level}\` > \`${card.level + 1}\` | ${client.icons.power} \`${Intl.NumberFormat().format(getPower(card.rank, card.level))}\` > \`${Intl.NumberFormat().format(getPower(card.rank, card.level + 1))}\``,
            `> - Tốn ${bold(ingredient.candy.toString())} ${client.items.candy.icon} + ${bold(ingredient.soul.toString())} ${client.items.soul.icon}`,
            `> - ${client.emoji.done} Nâng cấp thành công`,
        ];

        return await message.channel.send({ content: content.join("\n") });
    },
);
