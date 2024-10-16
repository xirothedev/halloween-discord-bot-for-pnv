import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { EmbedBuilder } from "discord.js";
import { inspect } from "node:util";
import { Category } from "typings/utils";

export default prefix(
    "addcandy",
    {
        description: {
            content: "Add kẹo hắc ám",
            usage: "addcandy <@user> <số lượng>",
            examples: ["addcandy @PNV 10"],
        },
        ownerOnly: true,
        category: Category.dev,
        hidden: true,
    },
    async (client, user, message, args) => {
        if (!args[0] || !args[1]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp người chơi và số lượng!")],
            });
        }

        if (isNaN(Number(args[1])) && Number(args[1]) % 1 === 0) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Sai định dạng số lượng!")],
            });
        }

        let member: any = args[0] && (client.users.cache.get(args[0]) || message.mentions.users.first());

        if (member) {
            member = await client.prisma.user.findUnique({ where: { user_id: member.id }, include: { cards: true } });
            if (!member) {
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Không tìm thấy dữ liệu của người này")],
                });
            }

            user = member;
        }

        await client.prisma.user.upsert({
            where: { user_id: user.user_id },
            create: { user_id: user.user_id, premium_candy: +args[1] },
            update: { premium_candy: { increment: +args[1] } },
        });

        return await message.react(client.emoji.done);
    },
);
