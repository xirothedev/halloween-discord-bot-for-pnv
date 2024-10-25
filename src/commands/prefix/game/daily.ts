import ranInt from "@/helpers/ranInt";
import DailyInterface from "@/interfaces/daily";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { addDays } from "date-fns";
import { Category } from "typings/utils";
import items from "@/data/items.json";

export default prefix(
    "daily",
    {
        description: {
            content: `điểm danh hằng ngày để nhận được ${items.candy.icon}. Điểm danh chuỗi 3 ngày nhận 1 pack ngẫu nhiên miễn phí. Reset lúc 0h hằng ngày.`,
            examples: ["daily"],
            usage: "daily",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const today = new Date();

        if (user.last_claim_daily && user.last_claim_daily.getTime() > today.setHours(0, 0, 0, 0)) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn đã nhận quà hôm nay rồi!")],
            });
        }

        let isBreakStreak;

        if (
            user.last_claim_daily &&
            user.last_claim_daily.getTime() < addDays(today.setHours(0, 0, 0, 0), -1).getTime()
        ) {
            isBreakStreak = true;
        } else {
            false;
        }

        const reward = isBreakStreak ? 5 : Math.round(5 * (user.streak_daily + 1));
        const pack = client.packs[ranInt(0, client.packs.length)];

        const data = await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                streak_daily: isBreakStreak ? 1 : { increment: 1 },
                last_claim_daily: new Date(),
                candy: { increment: reward },
                packs:
                    !isBreakStreak && (user.streak_daily + 1) % 3 === 0
                        ? {
                              upsert: {
                                  where: { pack_id_user_id: { pack_id: pack.id, user_id: user.user_id } },
                                  create: { pack_id: pack.id, quantity: 3 },
                                  update: { pack_id: pack.id, quantity: { increment: 3 } },
                              },
                          }
                        : {},
            },
        });

        return await message.channel.send({
            embeds: [new DailyInterface(client, message, data.streak_daily, reward)],
        });
    },
);
