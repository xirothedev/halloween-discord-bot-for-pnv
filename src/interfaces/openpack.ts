import ranColor from "@/helpers/ranColor";
import type { Rank } from "@prisma/client";
import { bold, EmbedBuilder, Message, resolveColor, type ColorResolvable } from "discord.js";
import type { Card } from "typings";
import type { FullUser } from "typings/command";

export default class OpenpackInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public pack: {
            id: string;
            name: string;
            icon: string;
            cards: string[];
        },
        public user: FullUser,
        public cards: Card[],
    ) {
        const card = `<:pnv_tick:1294013359330562100> ${bold("Bạn đã nhận được 3 lá bài:")}\n${cards.map(({ icon, name }) => `${icon} • ${name}`).join("\n")}`;

        const rate = `<:pnv_rate:1294010636602310666> ${bold("Bảo Hiểm Pack:")}\n> ${client.icons.s_rank} \`${user.streak_s}/1000\` ${client.icons.sr_rank} \`${user.streak_sr}/100\`\n> ${client.icons.r_rank} \`${user.streak_r}/50\` ${client.icons.a_rank} \`${user.streak_a}/10\``;

        const point = {
            s_rank: 5,
            sr_rank: 4,
            r_rank: 3,
            a_rank: 2,
            b_rank: 1,
        } as { [x: string]: number };

        const color = {
            s_rank: "#686D8C",
            sr_rank: "#FF5959",
            r_rank: "#CC6DE7",
            a_rank: "#233DFF",
            b_rank: "#50CB59",
        } as { [x: string]: ColorResolvable };

        let highestPoint: number = 0;
        let highestCard: Card = cards[0];
        let highestColor: ColorResolvable = color.b_rank;

        cards.forEach((card) => {
            if (point[card.rank] > highestPoint) {
                highestPoint = point[card.rank];
                highestColor = color[card.rank];
                highestCard = card;
            }
        });

        super({
            color: resolveColor(highestColor),
            author: {
                name: `Mở pack ${pack.name}`,
                icon_url: message.guild?.iconURL()!,
            },
            description: card + "\n\n" + rate,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            image: { url: highestCard.image },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/AlEF_ptB1JDppn6CtBZJ7lpL2KSIM0TaSpYxMJVINtY/https/cdn3.emoji.gg/emojis/5356-pin-pack-brawlstars.png",
            },
        });
    }
}
