import ranColor from "@/helpers/ranColor";
import ranInt from "@/helpers/ranInt";
import DailyInterface from "@/interfaces/daily";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { addDays } from "date-fns";
import { bold, EmbedBuilder, resolveColor } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "shop",
    {
        description: {
            content: "Xem shop.",
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
                name: `Cửa hàng của ${message.guild.name} ngày Halloween`,
                icon_url: message.guild?.iconURL()!,
            },
            description: `Tất cả vật phẩm độc quyền mùa Halloween sẽ có mặt ở đây\n- \`${process.env.PREFIX} buy <id vật phẩm>\` để mua vật phẩm\n- \`${process.env.PREFIX} openpack <id pack>\` để mở vật phẩm\n════════════════════════════════\n${items.join("\n")}`,
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
