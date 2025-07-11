import type { QuestFunction, Rank } from "@prisma/client";
import type { ColorResolvable } from "discord.js";

type QuestProps = {
    name: string;
    function: QuestFunction;
    item: string;
    rate: {
        target: number;
        amount: number;
    };
    channel?: string;
    pack?: Pack;
    won?: boolean;
};

type Items = {
    [key: string]: {
        id: string;
        name: string;
        icon: string;
    };
};

type Pack = {
    id: string;
    name: string;
    icon: string;
    color: ColorResolvable;
    image: string;
    cards: string[];
};

type Card = {
    id: string;
    name: string;
    icon: string;
    topic: string[];
    rank: string;
    rate: {
        shortName: string;
        fullName: string;
    };
    image: string;
};
