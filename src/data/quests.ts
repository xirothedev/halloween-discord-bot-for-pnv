import ranInt from "@/helpers/ranInt";
import { QuestFunction } from "@prisma/client";
import items from "@/data/items.json";
import channels from "@/data/channels.json";
import type { QuestProps } from "typings";

const generateRate = (min: number, max: number, divide: number) => {
    const target = ranInt(min, max);
    const amount = Math.floor(target / divide);

    return { target, amount };
};

const quests: QuestProps[] = [
    {
        name: "Nhắn $1 tin nhắn",
        function: QuestFunction.chat,
        item: items.candy.id,
        rate: generateRate(100, 1001, 25),
    },
    {
        name: "Nhắn $1 tin nhắn tại kênh $2",
        function: QuestFunction.chat_channel,
        item: items.candy.id,
        rate: generateRate(50, 501, 15),
        channel: channels[ranInt(0, channels.length)],
    },
    {
        name: "Treo voice $1 tiếng",
        function: QuestFunction.voice,
        item: items.candy.id,
        rate: generateRate(1, 5, 0.5),
    },
    {
        name: "Mở $1 pack",
        function: QuestFunction.open_pack,
        item: items.candy.id,
        rate: generateRate(1, 5, 0.5),
    },
    {
        name: "Boost server $1 lần",
        function: QuestFunction.boost,
        item: items.candy.id,
        rate: generateRate(1, 2, 0.01),
    },
    {
        name: "Nâng cấp thẻ $1 lần",
        function: QuestFunction.upgrade_card,
        item: items.candy.id,
        rate: generateRate(1, 5, 0.5),
    },
];

export default quests;
