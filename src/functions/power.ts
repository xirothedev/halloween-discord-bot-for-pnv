import type { Rank } from "@prisma/client";
import type { UserWithCards } from "typings/command";

export function getPower(cardRank: Rank, level: number) {
    let basePower;
    let levelUp;

    switch (cardRank) {
        case "b_rank":
            basePower = 50;
            levelUp = 20;
            break;

        case "a_rank":
            basePower = 60;
            levelUp = 30;
            break;

        case "r_rank":
            basePower = 90;
            levelUp = 40;
            break;

        case "sr_rank":
            basePower = 110;
            levelUp = 60;
            break;

        case "s_rank":
            basePower = 200;
            levelUp = 90;
            break;

        default:
            basePower = 0;
            levelUp = 0;
            break;
    }

    return basePower + levelUp * level;
}

export function resolvePower(user: UserWithCards, cardId: string | null) {
    const card = user.cards.find((f) => f.card_id === cardId);

    if (!card) return 0;

    return getPower(card.rank, card.level);
}
