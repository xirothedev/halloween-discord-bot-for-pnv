import items from "@/data/items.json";
import quests from "@/data/quests";
import ranInt from "@/helpers/ranInt";
import QuestInterface from "@/interfaces/quest";
import prefix from "@/layouts/prefix";
import type { Item, Quest } from "@prisma/client";
import { channelMention } from "discord.js";
import type { FullUser } from "typings/command";
import { Category } from "typings/utils";

type Type = Omit<Quest, "quest_id" | "user_id">;

export default prefix(
    "quest",
    {
        description: {
            content: `làm nhiệm vụ hằng ngày để được nhận ${items.candy.icon}. Reset lúc 12h và 0h hằng ngày.`,
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
        const now = new Date();

        const midnight = new Date(now.setHours(0, 0, 0, 0)); // 12:00 AM
        const midday = new Date(now.setHours(12, 0, 0, 0)); // 12:00 PM

        let quest: Type[] = [];

        if (now.getTime() < midday.getTime()) {
            if (user.last_claim_quest && user.last_claim_quest.getTime() > midnight.getTime()) {
                quest = user.quests || [];
            } else {
                await resetUserQuests(client, user, quest);
            }
        } else {
            if (user.last_claim_quest && user.last_claim_quest.getTime() > midday.getTime()) {
                quest = user.quests || [];
            } else {
                await resetUserQuests(client, user, quest);
            }
        }

        return message.channel.send({
            embeds: [new QuestInterface(client, message, quest)],
        });
    },
);

async function resetUserQuests(client: ExtendedClient, user: FullUser, quest: Type[]) {
    await client.prisma.quest.deleteMany({ where: { user_id: user.user_id } });

    for (let index = 0; index < 3; index++) {
        let q = quests[ranInt(0, quests.length)];

        if (quest.find((f) => f.function === q.function)) {
            q = quests[ranInt(0, quests.length)];
        }

        let name = q.name.replace("$1", q.rate.target.toString());

        if (q.channel) {
            name = name.replace("$2", channelMention(q.channel));
        }

        if (q.pack?.name) {
            name = name.replace("$2", q.pack.name);
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
