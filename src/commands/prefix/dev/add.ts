import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import type { User } from "discord.js";
import type { User as IUser } from "@prisma/client";
import { Category } from "typings/utils";

export default prefix(
    "add",
    {
        description: {
            content: "Add hoặc trừ vật phẩm",
            usage: "add <vật phẩm> <@user> <số lượng> (lý do)",
            examples: ["add candy @PNV 10 test", "add premium_candy @PNV -5"],
        },
        developersOnly: true,
        category: Category.dev,
        hidden: true,
    },
    async (client, user, message, args) => {
        const type = ["candy", "premium_candy", "soul", "soul_box"];

        const item = args.shift();
        const id = args.shift();
        const amount = Number(args.shift());
        const reason = args.join(" ");

        if (!item || !type.includes(item)) {
            return message.channel.send({
                embeds: [
                    new ErrorInterface(client).setDescription(`Bạn phải cung cấp tên vật phẩm: ${type.join(", ")}!`),
                ],
            });
        }

        if (!id || !amount) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp người chơi và số lượng!")],
            });
        }

        if (isNaN(amount) || !Number.isInteger(amount)) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Sai định dạng số lượng!")],
            });
        }

        let member: string | User | IUser | undefined | null =
            id && (client.users.cache.get(id) || message.mentions.users.first());

        if (member) {
            member = await client.prisma.user.findUnique({ where: { user_id: id } });
            if (!member) {
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Không tìm thấy dữ liệu của người này")],
                });
            }
        }

        await client.prisma.user.upsert({
            where: { user_id: id },
            create: { user_id: user.user_id, [item]: amount },
            update: { [item]: { increment: amount } },
        });

        const u = await client.users.fetch((member as IUser).user_id);
        const dmChannel = await u.createDM(true);
        await dmChannel.send(
            `> - Bạn đã được **${amount >= 0 ? "cộng" : "trừ"} ${amount}** ${client.items[item].icon} với lý do: **${reason || "Top Up"}**`,
        );

        return await message.react(client.emoji.done);
    },
);
