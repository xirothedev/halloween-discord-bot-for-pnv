import quests from "@/data/quests";
import ranInt from "@/helpers/ranInt";
import ErrorInterface from "@/interfaces/error";
import QuestInterface from "@/interfaces/quest";
import prefix from "@/layouts/prefix";
import type { Item, Quest } from "@prisma/client";
import { bold, channelMention } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "quest",
    {
        description: {
            content: "Hiển thị menu trợ giúp.",
            examples: ["quest"],
            usage: "quest",
        },
        aliases: ["q"],
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const today = new Date();

        let quest: Omit<Omit<Quest, "quest_id">, "user_id">[] = [];

        if (user.last_claim_quest && user.last_claim_quest.getTime() > today.setHours(0, 0, 0, 0)) {
            if (!user?.quests) {
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Bạn không có quest để hiển thị")],
                });
            } else {
                quest = user.quests;
            }
        } else {
            await client.prisma.quest.deleteMany({ where: { user_id: user.user_id } });
            for (let index = 0; index < 3; index++) {
                let q = quests[ranInt(0, quests.length)];

                if (quest.find((f) => f.function === q.function)) {
                    q = quests[ranInt(0, quests.length)];
                }

                let name = q.name.replace("$1", q.rate.target.toString());

                if (q.channel) {
                    name.replace("$2", channelMention(q.channel));
                }

                if (q.pack) {
                    name.replace("$2", bold(q.pack.name));
                }

                quest.push({
                    function: q.function,
                    name,
                    reward_amount: q.rate.amount,
                    reward_item: q.item as Item,
                    target: q.rate.target,
                    progress: 0,
                    channel_id: q.channel || null,
                    pack_id: q.pack?.id || null,
                    claimed: false,
                });
            }

            await client.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    last_claim_quest: new Date(),
                    quests: {
                        createMany: { data: quest, skipDuplicates: true },
                    },
                },
            });
        }

        return message.channel.send({
            embeds: [new QuestInterface(client, message, quest)],
        });
    },
);
