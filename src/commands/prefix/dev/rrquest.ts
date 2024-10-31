import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { codeBlock } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "rrquest",
    {
        description: {
            content: "Reroll quest người dùng",
            usage: "rrquest <@user>",
            examples: ["rrquest @PNV"],
        },
        developersOnly: true,
        category: Category.dev,
        hidden: true,
    },
    async (client, user, message, args) => {
        if (!args[0]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp người chơi!")],
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

        await client.prisma.user.update({ where: { user_id: user.user_id }, data: { last_claim_quest: null } });

        return await message.react(client.emoji.done);
    },
);
