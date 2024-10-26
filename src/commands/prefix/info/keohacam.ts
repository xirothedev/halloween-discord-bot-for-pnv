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
                `
                ${client.items.premium_candy.icon} **| Kẹo Hắc Ám**
                
                > - Vật phẩm có được khi mua bằng VND <:pnv_logomoney:878391201366151218>.
                > - Mở ticket tại https://discord.com/channels/755793441287438469/919342147822555166 hoặc DMs <@523708248600346635> để được hỗ trợ.
                > - Dùng để mua vật phẩm trong shop.
                > - Bảng giá: **1000** <:pnv_logomoney:878391201366151218> = **1** ${client.items.premium_candy.icon}
                `,
            )
            .setThumbnail(
                "https://cdn.discordapp.com/attachments/1298639628982816798/1299408348138967070/BIDV_1702006307419.png?ex=671d17d4&is=671bc654&hm=d2b9649e2a11539a97a4d88932aa9800a2fabae2349753c67ccbbbfa5eee8f07&",
            )
            .setFooter({
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            });

        return await message.channel.send({ embeds: [embed] });
    },
);
