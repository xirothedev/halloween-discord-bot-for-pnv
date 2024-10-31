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
        aliases: ["keo"],
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.info,
    },
    async (client, user, message, args) => {
        const embed = new EmbedBuilder()
            .setColor(ranColor(client.colors.main))
            .setDescription(
                `
                ${client.items.candy.icon} **| Kẹo Cam**\n\n> - Vật phẩm có được thông qua thách đấu, điểm danh hằng ngày, làm nhiệm vụ hoặc bán thẻ thừa.
                > - Dùng để nâng cấp card, mua vật phẩm trong shop.
                `,
            )
            .setFooter({
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            });

        return await message.channel.send({ embeds: [embed] });
    },
);
