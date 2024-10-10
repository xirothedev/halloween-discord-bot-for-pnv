import getPower from "@/functions/getBasePower";
import ranColor from "@/helpers/ranColor";
import { EmbedBuilder, Message, resolveColor } from "discord.js";
import type { FullUser, UserWithCards } from "typings/command";

export default class ProfileInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: FullUser,
    ) {
        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: `Profile của ${message.author.username}`,
                icon_url: message.guild?.iconURL()!,
            },
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: {
                url: "https://images-ext-1.discordapp.net/external/BBNdTd7dwpLmwjyT6xCsTow-pOo7fSmQHIqpCvQ3Fys/https/cdn-icons-png.flaticon.com/128/1183/1183774.png",
            },
        });
    }

    public async getTopPremiumCandy() {
        const premiumCandy = await this.client.prisma.user.findMany({
            where: { premium_candy: { gt: this.user.premium_candy } },
        });

        return premiumCandy.length;
    }

    public async getWinnerStreak() {
        const winnerStreak = await this.client.prisma.user.findMany({
            where: { streak_winner: { gt: this.user.streak_winner } },
        });

        return winnerStreak.length;
    }

    public async getTopPower(userWithCard: UserWithCards) {
        const card = userWithCard.cards.find((f) => f.card_id === this.user.card_id);

        if (!card) return 0;

        return getPower(card.rank, card.level);
    }
}
