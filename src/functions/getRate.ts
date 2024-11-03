import type { Rank } from "@prisma/client";

export default function getRate(rank: Rank) {
    switch (rank) {
        case "b_rank":
            return 90;
        case "a_rank":
            return 6;
        case "r_rank":
            return 2;
        case "sr_rank":
            return 1.5;
        case "s_rank":
            return 0.5;

        default:
            return 0;
    }
}
