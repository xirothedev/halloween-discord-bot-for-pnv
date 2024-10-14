import type { Rank } from "@prisma/client";

export default function getPower(cardRank: Rank, level: number) {
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
