import claimQuest from "@/functions/claimQuest";
import ranInt from "@/helpers/ranInt";
import ErrorInterface from "@/interfaces/error";
import OpenpackInterface from "@/interfaces/openpack";
import prefix from "@/layouts/prefix";
import type { Rank } from "@prisma/client";
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
        if (!args[0]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp id vật phẩm")],
            });
        }

        // code tạm
        if (
            args[0] === client.items.soul_box.id ||
            args[0] === "sb" ||
            args.join(" ").toLowerCase() === client.items.soul_box.name.toLowerCase()
        ) {
            const souls = ranInt(10, 51);

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

        const item = client.packs.find(
            (f) =>
                f.id === args[0] ||
                f.name.toLowerCase() === args.join(" ").toLowerCase() ||
                f.name
                    .split(" ")
                    .map((m) => m.slice(0, 1))
                    .join("")
                    .toLowerCase() === args[0].toLowerCase(),
        );

        if (!item) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Vật phẩm này không thể mở")],
            });
        }

        const pack = user.packs.find((f) => f.pack_id === item.id);

        if (!pack || pack.quantity <= 0) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có vật phẩm này")],
            });
        }

        const cards = [];
        const card = client.cards.filter((f) => f.topic === pack.pack_id);

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
                            OR: [{ function: "open" }, { function: "open_pack", pack_id: pack.pack_id }],
                            claimed: false,
                        },
                        data: { progress: { increment: 1 } },
                    },
                },
            },
            include: { quests: true, cards: true, packs: true },
        });

        const finishedQuests = user.quests.filter(
            (f) => (f.function === "open" || f.function === "open_pack") && f.progress >= f.target,
        );

        if (finishedQuests) {
            await Promise.all(
                finishedQuests.map(async (finishedQuest) => await claimQuest(client, user, finishedQuest)),
            );
        }

        return await message.channel.send({ embeds: [new OpenpackInterface(client, message, item, user, cards)] });
    },
);
