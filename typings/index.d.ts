import type { QuestFunction, Rank } from "@prisma/client";

type QuestProps = {
    name: string;
    function: QuestFunction;
    item: string;
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
    };
};

type Card = {
    id: string;
    name: string;
    icon: string;
    topic: string;
    rank: string;
    rate: {
        shortName: string;
        fullName: string;
    };
    image: string;
};
