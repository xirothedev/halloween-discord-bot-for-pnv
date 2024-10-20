import CardInterface from "@/interfaces/card";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { Category } from "typings/utils";

export default prefix(
    "card",
    {
        description: {
            content: `xem thông tin card được chỉ định bao gồm pack, cấp bậc, cấp, sức mạnh. Có thể dùng cho cả những card bạn chưa mở ra nhưng không hiển thị thông số card.`,
            examples: ["card c1", "card scarlet_witch"],
            usage: "card <id/tên card>",
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

        const card = client.cards.find((f) => f.id === args[0] || f.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!card) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy card")],
            });
        }

        return await message.channel.send({
            embeds: [new CardInterface(client, message, user, card)],
        });
    },
);
