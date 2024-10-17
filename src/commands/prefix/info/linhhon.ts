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
                `${client.items.soul.icon} **|** là một vật phẩm có thể kiếm được qua việc thách đấu. Dùng để nâng cấp thẻ của bạn`,
            );

        return await message.channel.send({ embeds: [embed] });
    },
);
