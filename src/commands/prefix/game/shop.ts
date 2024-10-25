import ranColor from "@/helpers/ranColor";
import prefix from "@/layouts/prefix";
import { bold, EmbedBuilder, resolveColor } from "discord.js";
import { Category } from "typings/utils";
import items from "@/data/items.json";
import ranInt from "@/helpers/ranInt";

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
            return `<:pnv_chamcam:1293566504524185642> Pack \`${pack.name} (${pack.name
                .split(" ")
                .map((m) => m.slice(0, 1))
                .join("")
                .toLowerCase()})\`: ${bold("30")} ${client.items.candy.icon} hoặc ${bold("4")} ${client.items.premium_candy.icon}`;
        });

        items.push(
            `\n<:pnv_chamcam:1293566504524185642> Vật phẩm đặc biệt \`Soul Box (sb)\`: ${bold("6")} ${client.items.premium_candy.icon}`,
        );

        const images = [
            "https://cdn.discordapp.com/attachments/1293978154163114115/1299057435167686676/cv_banner-01.jpg?ex=671c79c3&is=671b2843&hm=814494991f34da5e57f24622873549519b9ac8ec876309c37f8ba611df1440b4&",
            "https://cdn.discordapp.com/attachments/1293978154163114115/1299057435595509852/myth_banner.jpg?ex=671c79c3&is=671b2843&hm=ee61dad44f7d8a4b30a0e7c71e604a56112a610032dfd0926aea18568702fc19&",
            "https://cdn.discordapp.com/attachments/1293978154163114115/1299057436002619514/tot_banner-01.jpg?ex=671c79c4&is=671b2844&hm=a2a5a3a67e6712dabca6caa70cbdff47526f5217f2e73ab0d36319c5813d1b70&",
            "https://cdn.discordapp.com/attachments/1293978154163114115/1299057436375908373/ub_banner.jpg?ex=671c79c4&is=671b2844&hm=068bb837f4c1632be744afc74081df12299bb2acbdbfc81809f821b7be5a1b94&",
        ];

        const image = images[ranInt(0, images.length)];

        const embed = new EmbedBuilder({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: `Cửa hàng Halloween tại ${message.guild.name}`,
                icon_url: message.guild?.iconURL()!,
            },
            description: `Tất cả vật phẩm độc quyền mùa Halloween sẽ có mặt ở đây\n- \`${process.env.PREFIX} buy <số lượng> <id vật phẩm>\` để mua vật phẩm\n- \`${process.env.PREFIX} open <id pack>\` để mở vật phẩm\n════════════════════════════════\n${items.join("\n")}`,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            image: { url: image },
        });

        return await message.channel.send({ embeds: [embed] });
    },
);
