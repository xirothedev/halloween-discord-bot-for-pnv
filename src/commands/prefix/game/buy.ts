import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { Category } from "typings/utils";
import items from "@/data/items.json";

export default prefix(
    "buy",
    {
        description: {
            content: `Mua các vật phẩm sự kiện tại cửa hàng Halloween bằng ${items.candy.icon} và ${items.premium_candy.icon}.`,
            examples: ["buy 1 Urban Legends", "buy 2 tot"],
            usage: "buy <số lượng> <id/tên vật phẩm>",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const amount = Number(args.shift());

        if (!amount || isNaN(amount)) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp số lượng cần mua")],
            });
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp id card")],
            });
        }

        const pack = client.packs.find(
            (f) =>
                f.id === args[0] ||
                f.name.toLowerCase() === args.join(" ").toLowerCase() ||
                f.name
                    .split(" ")
                    .map((m) => m.slice(0, 1))
                    .join("")
                    .toLowerCase() === args[0].toLowerCase(),
        );

        if (!pack) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy vật phẩm")],
            });
        }

        if (user.candy < 25 * amount) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.candy.icon)],
            });
        }

        await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                candy: { decrement: 25 * amount },
                packs: {
                    upsert: {
                        where: { pack_id_user_id: { pack_id: pack.id, user_id: user.user_id } },
                        update: { quantity: { increment: amount } },
                        create: { pack_id: pack.id, quantity: amount },
                    },
                },
            },
        });

        return await message.react(client.emoji.done);
    },
);
