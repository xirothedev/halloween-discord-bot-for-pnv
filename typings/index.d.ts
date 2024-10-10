import type { QuestFunction, Rank } from "@prisma/client";

type QuestProps = {
    name: string;
    function: QuestFunction;
    item: string;
    rank: Rank;
    rate: {
        target: number;
        amount: number;
    };
    channel?: string;
};

type Items = {
    [key: string]: {
        id: string;
        name: string;
        icon: string;
        useable: boolean;
    };
};
