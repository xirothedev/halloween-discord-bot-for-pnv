import ranColor from "@/helpers/ranColor";
import prefix from "@/layouts/prefix";
import { EmbedBuilder } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "linhhon",
    {
        description: {
            content: "Xem thông tin linh hồn.",
            examples: ["linhhon"],
            usage: "linhhon",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.info,
    },
    async (client, user, message, args) => {
        const embed = new EmbedBuilder()
            .setColor(ranColor(client.colors.main))
            .setDescription(
                `${client.items.soul.icon} **| Linh Hồn**\n\n> - Vật phẩm có được thông qua thách đấu với người chơi khác.\n> - Dùng để nâng cấp card.`,
            );

        return await message.channel.send({ embeds: [embed] });
    },
);
