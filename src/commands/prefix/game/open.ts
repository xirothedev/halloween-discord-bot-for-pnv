import claimQuest from "@/functions/claimQuest";
import findPack from "@/functions/findPack";
import ranInt from "@/helpers/ranInt";
import ErrorInterface from "@/interfaces/error";
import OpenpackInterface from "@/interfaces/openpack";
import prefix from "@/layouts/prefix";
import type { Rank } from "@prisma/client";
import { time } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "open",
    {
        description: {
            content: `Mở pack/box linh hồn đang có trong bst. Mỗi pack mở ra được 3 cards/ngẫu nhiên linh hồn, mỗi lượt mở được 1 pack/1 box.`,
            examples: ["open hellpack", "open soul box"],
            usage: "open <tên vật phẩm>",
        },
        aliases: ["op"],
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const itemId = args[0];

        if (!itemId) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp id vật phẩm")],
            });
        }

        const isSoulBox =
            itemId === client.items.soul_box.id ||
            ["sb", client.items.soul_box.name.toLowerCase()].includes(itemId.toLowerCase());
        if (isSoulBox) {
            if (user.soul_box <= 0) {
                return message.channel.send({
                    embeds: [
                        new ErrorInterface(client).setDescription(`Bạn không có đủ ${client.items.soul_box.icon}`),
                    ],
                });
            }

            const souls = ranInt(10, 31);
            await client.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    soul: { increment: souls },
                    soul_box: { decrement: 1 },
                },
            });

            return message.channel.send({
                content: `${client.items.soul_box.icon} | Bạn đã mở hộp linh hồn và nhận được **${souls}** ${client.items.soul.icon}!`,
            });
        }

        const item = findPack(client, args);

        if (!item) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Vật phẩm này không thể mở")],
            });
        }

        // Check if user owns the item
        const pack = user.packs.find((p) => p.pack_id === item.id);
        if (!pack || pack.quantity <= 0) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có vật phẩm này")],
            });
        }

        const cardPool = client.cards.filter((card) => card.topic.includes(pack.pack_id));
        const cards = [];
        let { streak_a, streak_r, streak_sr, streak_s } = user;

        streak_a += 3;
        streak_r += 3;
        streak_sr += 3;
        streak_s += 3;

        for (let i = 0; i < 3; i++) {
            const rand = ranInt(1, 10001);

            let filteredCards;
            if (streak_a >= 10 || rand <= 600) {
                filteredCards = cardPool.filter((card) => card.rate.shortName === "A");
                streak_a = 0;
            } else if (streak_r >= 50 || rand <= 200) {
                filteredCards = cardPool.filter((card) => card.rate.shortName === "R");
                streak_r = 0;
            } else if (streak_sr >= 100 || rand <= 150) {
                filteredCards = cardPool.filter((card) => card.rate.shortName === "SR");
                streak_sr = 0;
            } else if (streak_s >= 1000 || rand <= 50) {
                filteredCards = cardPool.filter((card) => card.rate.shortName === "S");
                streak_s = 0;
            } else {
                filteredCards = cardPool.filter((card) => card.rate.shortName === "B");
            }

            const card = filteredCards[ranInt(0, filteredCards.length)];
            cards.push(card);

            await client.prisma.card.upsert({
                where: { card_id_user_id: { card_id: card.id, user_id: user.user_id } },
                update: { quantity: { increment: 1 } },
                create: {
                    card_id: card.id,
                    user_id: user.user_id,
                    rank: card.rank as Rank,
                    name: card.name,
                    image: card.image,
                },
            });

            if (["s_rank", "sr_rank"].includes(card.rank) && client.notiChannel?.isSendable()) {
                await client.notiChannel.send(
                    `[ ${card.rank === "s_rank" ? client.icons.s_rank : client.icons.sr_rank} ] ${message.author.toString()} đã mở ra được ${card.name} vào lúc ${time(new Date(), "R")}`,
                );
            }
        }

        user = await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                streak_a,
                streak_r,
                streak_sr,
                streak_s,
                total_pack: { increment: 3 },
                packs: {
                    update: {
                        where: { pack_id_user_id: { pack_id: pack.pack_id, user_id: user.user_id } },
                        data: { quantity: { decrement: 1 } },
                    },
                },
                quests: {
                    updateMany: {
                        where: {
                            function: "open",
                            claimed: false,
                        },
                        data: { progress: { increment: 1 } },
                    },
                },
            },
            include: { quests: true, cards: true, packs: true },
        });

        const packQuest = user.quests.find((f) => f.function === "open_pack" && f.pack_id === item.id && !f.claimed);

        if (packQuest) {
            console.log("Mở pack: ", packQuest.pack_id);
            if (client.logQuestChannel?.isSendable()) {
                client.logQuestChannel.send("Mở pack: " + packQuest.pack_id);
            }

            const data = await client.prisma.quest.update({
                where: { quest_id: packQuest.quest_id },
                data: { progress: { increment: 1 } },
            });

            if (data.progress >= data.target && !data.claimed) {
                claimQuest(client, user, data);
            }
        }

        // Automatically claim completed quests
        const finishedQuest = user.quests.find(
            (quest) => quest.function === "open" && quest.progress >= quest.target && !quest.claimed,
        );
        if (finishedQuest) {
            claimQuest(client, user, finishedQuest);
        }

        return message.channel.send({ embeds: [new OpenpackInterface(client, message, item, user, cards)] });
    },
);
