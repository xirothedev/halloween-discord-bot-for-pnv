import ranInt from "@/helpers/ranInt";
import DailyInterface from "@/interfaces/daily";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { addDays } from "date-fns";
import { Category } from "typings/utils";

export default prefix(
    "buy",
    {
        description: {
            content: "Điểm danh hằng ngày.",
            examples: ["buy Urban Legends"],
            usage: "buy",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        if (!args[0]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp id card")],
            });
        }

        const pack = client.packs.find(
            (f) => f.id === args[0] || f.name.toLowerCase() === args.join(" ").toLowerCase(),
        );

        if (!pack) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy vật phẩm")],
            });
        }

        if (user.candy < 25) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.candy.icon)],
            });
        }

        await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: { candy: { decrement: 25 } },
        });

        return await message.react(client.emoji.done);
    },
);
