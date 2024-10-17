import ranColor from "@/helpers/ranColor";
import prefix from "@/layouts/prefix";
import { EmbedBuilder } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "keocam",
    {
        description: {
            content: "Xem thông tin kẹo cam.",
            examples: ["keocam"],
            usage: "keocam",
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
                `${client.items.premium_candy.icon} **|** là một vật phẩm có thể kiếm được qua việc thách đấu, điểm danh, làm nhiệm vụ. Dùng để nâng cấp thẻ và mua đồ trong shop`,
            );

        return await message.channel.send({ embeds: [embed] });
    },
);
