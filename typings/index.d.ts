import type { QuestFunction } from "@prisma/client";

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
