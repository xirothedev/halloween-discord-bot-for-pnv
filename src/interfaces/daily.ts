import ranColor from "@/helpers/ranColor";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";

export default class DailyInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public streakDaily: number,
        public candyReward: number,
    ) {
        let description = `> - Bạn đã điểm danh liên tiếp ${bold(`${streakDaily} ngày`)}\n> - Phần thưởng: ${bold(`x${candyReward}`)} ${client.items.candy.icon}`;

        if (streakDaily % 3 === 0) {
            description =
                description +
                `\n\n<a:pnv_pumpkinlaugh:1032767073874620447> Chuỗi 3 ngày: ${bold(`x3`)} ${client.packs[0].icon}`;
        } else {
            description =
                description +
                `\n\n<a:pnv_pumpkinlaugh:1032767073874620447> Điểm danh thêm ${bold(`${3 - (streakDaily % 3)} ngày`)} để nhận ${bold(`x3`)} ${client.packs[0].icon}`;
        }

        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: "Điểm Danh Thành Công !",
                icon_url: message.guild?.iconURL()!,
            },
            description,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/u9tZVpEyl0PT5_GuPdZGpo2IsgqEr-lnmoHO4c29lso/https/cdn-icons-png.flaticon.com/128/3684/3684993.png",
            },
        });
    }
}
