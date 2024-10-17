import ranColor from "@/helpers/ranColor";
import prefix from "@/layouts/prefix";
import { EmbedBuilder } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "keohacam",
    {
        description: {
            content: "Xem thông tin kẹo hắc ám.",
            examples: ["keohacam"],
            usage: "keohacam",
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
                `${client.items.premium_candy.icon} **|** là một vật phẩm có chỉ có thể kiếm được bằng cách nạp tiền. Dùng để mua các vật phẩm trong shop một cách rẻ hơn`,
            );

        return await message.channel.send({ embeds: [embed] });
    },
);
