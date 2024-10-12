import claimQuest from "@/functions/claimQuest";
import ranInt from "@/helpers/ranInt";
import ErrorInterface from "@/interfaces/error";
import OpenpackInterface from "@/interfaces/openpack";
import prefix from "@/layouts/prefix";
import type { Rank } from "@prisma/client";
import { Category } from "typings/utils";

export default prefix(
    "openpack",
    {
        description: {
            content: "Mở pack.",
            examples: ["openpack hellpack"],
            usage: "openpack <tên pack>",
        },
        aliases: ["op", "open"],
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

        const item = client.packs.find((f) => f.id === args[0]);
        const pack = user.packs.find((f) => f.pack_id === args[0]);
        const _pack = client.packs.find((f) => f.id === args[0]);

        if (!item || !_pack || !pack || pack.quantity <= 0) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Vật phẩm này không thể mở")],
            });
        }

        const cards = [];
        const card = client.cards.filter((f) => f.topic === args[0]);

        let streak_a = user.streak_a;
        let streak_r = user.streak_r;
        let streak_sr = user.streak_sr;
        let streak_s = user.streak_s;

        for (let index = 0; index < 3; index++) {
            let c;
            streak_a++;
            streak_r++;
            streak_sr++;
            streak_s++;
            const rand = ranInt(1, 101);

            if (streak_a >= 10) {
                c = card.filter((f) => f.rate.shortName === "A");
                streak_a = 0;
            } else if (streak_r >= 50) {
                c = card.filter((f) => f.rate.shortName === "R");
                streak_r = 0;
            } else if (streak_sr >= 100) {
                c = card.filter((f) => f.rate.shortName === "SR");
                streak_sr = 0;
            } else if (streak_s >= 1000) {
                c = card.filter((f) => f.rate.shortName === "S");
                streak_s = 0;
            } else if (rand <= 0.25) {
                c = card.filter((f) => f.rate.shortName === "S");
                streak_s = 0;
            } else if (rand <= 0.75) {
                c = card.filter((f) => f.rate.shortName === "SR");
                streak_sr = 0;
            } else if (rand <= 1) {
                c = card.filter((f) => f.rate.shortName === "R");
                streak_r = 0;
            } else if (rand <= 3) {
                c = card.filter((f) => f.rate.shortName === "A");
                streak_a = 0;
            } else {
                c = card.filter((f) => f.rate.shortName === "B");
            }

            const _c = c[ranInt(0, c.length)];
            cards.push(_c);
            await client.prisma.card.upsert({
                where: { card_id_user_id: { card_id: _c.id, user_id: user.user_id } },
                update: { quantity: { increment: 1 } },
                create: {
                    card_id: _c.id,
                    user_id: user.user_id,
                    rank: _c.rank as Rank,
                    name: _c.name,
                    image: _c.image,
                },
            });
        }

        const data = await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                streak_a,
                streak_r,
                streak_sr,
                streak_s,
                total_pack: { increment: 3 },
                packs: {
                    update: {
                        where: { pack_id_user_id: { pack_id: args[0], user_id: user.user_id } },
                        data: { quantity: { decrement: 1 } },
                    },
                },
                quests: {
                    updateMany: {
                        where: { function: "open_pack", claimed: false },
                        data: { progress: { increment: 1 } },
                    },
                },
            },
            include: { quests: true },
        });

        const finishedQuest = data.quests.find((f) => f.function === "open_pack" && f.progress >= f.target);

        if (finishedQuest) {
            await claimQuest(client, user, finishedQuest);
        }

        return await message.channel.send({ embeds: [new OpenpackInterface(client, message, _pack, user, cards)] });
    },
);
