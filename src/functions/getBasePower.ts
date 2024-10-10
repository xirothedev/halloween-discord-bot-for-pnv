import type { Rank } from "@prisma/client";

export default function getPower(cardRank: Rank, level: number) {
    let basePower;

    switch (cardRank) {
        case "b_rank":
            basePower = 5;
            break;

        case "a_rank":
            basePower = 10;
            break;

        case "r_rank":
            basePower = 15;
            break;

        case "sr_rank":
            basePower = 20;
            break;

        case "s_rank":
            basePower = 25;
            break;

        default:
            basePower = 0;
            break;
    }

    return basePower * level;
}
