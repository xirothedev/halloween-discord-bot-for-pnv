import type { Rank } from "@prisma/client";

export default function getRate(rank: Rank) {
    switch (rank) {
        case "b_rank":
            return 95;
        case "a_rank":
            return 3;
        case "r_rank":
            return 1;
        case "sr_rank":
            return 0.75;
        case "s_rank":
            return 0.25;

        default:
            return 0;
    }
}
