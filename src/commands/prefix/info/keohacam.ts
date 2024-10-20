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
                `${client.items.premium_candy.icon} | Kẹo Hắc Ám\n> - Vật phẩm có được khi mua bằng VND <:pnv_logomoney:878391201366151218>. Mở ticket tại https://discord.com/channels/755793441287438469/919342147822555166 để được hỗ trợ.\n> - Dùng để mua vật phẩm trong shop.`,
            );

        return await message.channel.send({ embeds: [embed] });
    },
);
