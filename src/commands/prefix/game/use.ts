import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { Category } from "typings/utils";

export default prefix(
    "use",
    {
        description: {
            content: "Sử dụng thẻ.",
            examples: ["use u1", "use skeleton"],
            usage: "use <id/tên card>",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const card = user.cards.find(
            (f) => f.card_id === args[0] || f.name.toLowerCase() === args.join(" ").toLowerCase(),
        );

        if (!card) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy thẻ")],
            });
        }

        await client.prisma.user.update({ where: { user_id: user.user_id }, data: { card_id: card.card_id } });

        return await message.react(client.emoji.done);
    },
);
