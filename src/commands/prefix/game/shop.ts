import ranColor from "@/helpers/ranColor";
import prefix from "@/layouts/prefix";
import { bold, EmbedBuilder, resolveColor } from "discord.js";
import { Category } from "typings/utils";
import items from "@/data/items.json";

export default prefix(
    "shop",
    {
        description: {
            content: `mở cửa hàng Halloween để mua các vật phẩm sự kiện bằng ${items.candy.icon} và ${items.premium_candy.icon}.`,
            examples: ["shop"],
            usage: "shop",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const items = client.packs.map((pack) => {
            return `<:pnv_chamcam:1293566504524185642> Pack \`${pack.name}\`: ${bold("25")} ${client.items.candy.icon}`;
        });

        const embed = new EmbedBuilder({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: `Cửa hàng Halloween tại ${message.guild.name}`,
                icon_url: message.guild?.iconURL()!,
            },
            description: `Tất cả vật phẩm độc quyền mùa Halloween sẽ có mặt ở đây\n- \`${process.env.PREFIX} buy <số lượng> <id vật phẩm>\` để mua vật phẩm\n- \`${process.env.PREFIX} openpack <id pack>\` để mở vật phẩm\n════════════════════════════════\n${items.join("\n")}`,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });

        return await message.channel.send({ embeds: [embed] });
    },
);
