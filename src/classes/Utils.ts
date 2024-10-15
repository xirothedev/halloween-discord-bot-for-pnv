import type { Card } from "@prisma/client";
import type { FullUser } from "typings/command";

export default class Utils {
    constructor(private client: ExtendedClient) {}

    public async getTopPremiumCandy(user: FullUser) {
        const premiumCandy = await this.client.prisma.user.findMany({
            where: { premium_candy: { lt: user.premium_candy } },
        });

        return premiumCandy.length;
    }

    public async getTopCandy(user: FullUser) {
        const premiumCandy = await this.client.prisma.user.findMany({
            where: { candy: { lt: user.candy } },
        });

        return premiumCandy.length;
    }

    public async getWinnerStreak(user: FullUser) {
        const winnerStreak = await this.client.prisma.user.findMany({
            where: { streak_winner: { lt: user.streak_winner } },
        });

        return winnerStreak.length;
    }

    public getFinisedPack(user: FullUser) {
        let count = 0;

        for (let index = 0; index < this.client.packs.length; index++) {
            if (this.client.packs[index].cards.every((f) => user.cards.find((_f) => _f.card_id === f))) {
                count++;
            }
        }

        return count;
    }

    public getFinisedCard(user: FullUser, packId: string) {
        const allCard: Card[] = [];
        const pack = this.client.packs.find((f) => f.id === packId);

        if (!pack)
            return {
                cards: allCard,
                pack: null,
            };

        pack.cards.map((card) => {
            const search = user.cards.find((f) => f.card_id === card);
            if (search) {
                allCard.push(search);
            }
        });

        return {
            cards: allCard,
            pack,
        };
    }
}
