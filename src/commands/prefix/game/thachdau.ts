import claimQuest from "@/functions/claimQuest";
import { getPower } from "@/functions/power";
import ranInt from "@/helpers/ranInt";
import BattleInterface from "@/interfaces/battle";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import type { Card } from "@prisma/client";
import { Category } from "typings/utils";
import items from "@/data/items.json";
import { cooldown } from "@/events/cMessageCreate";

export default prefix(
    "thachdau",
    {
        description: {
            content: `Sử dụng card để thách đấu với người chơi ngẫu nhiên khác. Chiến thắng sẽ nhận được ${items.candy.icon} và ${items.soul.icon}.`,
            examples: ["thachdau"],
            usage: "thachdau",
        },
        aliases: ["td"],
        cooldown: "5m",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        try {
            if (!user.card_id) {
                cooldown.delete(message.author.id);
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Bạn chưa chọn card để thách đấu")],
                });
            }

            const rate = ranInt(0, 6);
            const won = rate === 0 ? null : rate <= 2 ? false : true;

            const users = await client.prisma.user.findMany({ include: { cards: true } });
            const cards: Card[] = [];

            users.forEach((_user) => {
                if (_user.cards.length <= 0 || _user.user_id === user.user_id) return;
                cards.push(..._user.cards);
            });
            const UserCard = user.cards.find((f) => f.card_id === user.card_id)!;

            const userPower = getPower(UserCard.rank, UserCard.level);

            const cardsUsed = cards.filter((f) => {
                const power = getPower(f.rank, f.level);
                if (won === true) {
                    return power < userPower;
                } else if (won === false) {
                    return power > userPower;
                } else if (won === null) {
                    return power === userPower;
                }
                return false;
            });

            if (cardsUsed.length <= 0) {
                cooldown.delete(message.author.id);
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Không tìm thấy đối thủ")],
                });
            }

            const cardUsed = cardsUsed[ranInt(0, cardsUsed.length - 1)];

            const enemy = await client.prisma.user.findUnique({
                where: { user_id: cardUsed.user_id },
                include: { cards: true },
            });

            if (!enemy) {
                cooldown.delete(message.author.id);
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Đã xảy ra lỗi khi tìm đối thủ")],
                });
            }

            const reward: { candy: number; soul: number } = { candy: 0, soul: 0 };

            if (won) {
                reward.candy = ranInt(1, 21) + user.streak_winner * 3;
                reward.soul = ranInt(1, 6) + user.streak_winner * 3;

                user = await client.prisma.user.update({
                    where: { user_id: user.user_id },
                    data: {
                        candy: { increment: reward.candy },
                        soul: { increment: reward.soul },
                        streak_winner: { increment: 1 },
                        quests: {
                            updateMany: {
                                where: {
                                    function: "win_battle",
                                    claimed: false,
                                },
                                data: { progress: { increment: 1 } },
                            },
                        },
                    },
                    include: { cards: true, packs: true, quests: true },
                });

                const finishedQuestWinner = user.quests.find(
                    (f) => f.function === "win_battle" && f.progress >= f.target && !f.claimed,
                );

                if (finishedQuestWinner) {
                    await claimQuest(client, user, finishedQuestWinner);
                }
            } else if (won === false) {
                user = await client.prisma.user.update({
                    where: { user_id: user.user_id },
                    data: { streak_winner: 0 },
                    include: { cards: true, packs: true, quests: true },
                });
            }

            user = await client.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    quests: {
                        updateMany: {
                            where: {
                                function: "battle",
                                claimed: false,
                            },
                            data: { progress: { increment: 1 } },
                        },
                    },
                },
                include: { quests: true, cards: true, packs: true },
            });

            if (user.highest_streak_winner < user.streak_winner) {
                user = await client.prisma.user.update({
                    where: { user_id: user.user_id },
                    data: { highest_streak_winner: user.streak_winner },
                    include: { quests: true, cards: true, packs: true },
                });
            }

            const fetchEnemyUser = await client.users.fetch(cardUsed.user_id);

            if (client.logQuestChannel?.isSendable() && fetchEnemyUser) {
                client.logQuestChannel.send(
                    `Battle: ${message.author.username} ${won === true ? "thắng" : won === false ? "thua" : "hòa"} ${fetchEnemyUser.username}`,
                );
            }

            const finishedQuest = user.quests.find(
                (f) => f.function === "battle" && f.progress >= f.target && !f.claimed,
            );

            if (finishedQuest) {
                await claimQuest(client, user, finishedQuest);
            }

            await message.channel.send({
                embeds: [new BattleInterface(client, message, user, cardUsed, won, reward)],
            });
        } catch (error) {
            console.log(error);
            cooldown.delete(message.author.id);
            await message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Đã xảy ra lỗi")],
            });
        }
    },
);
