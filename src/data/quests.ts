import items from "@/data/items.json";
import packs from "@/data/packs.json";
import ranInt from "@/helpers/ranInt";
import { QuestFunction } from "@prisma/client";
import type { Pack, QuestProps } from "typings";

const generateRate = (min: number, max: number) => {
    const target = ranInt(min, max);
    const amount = ranInt(90, 111);

    return { target, amount };
};

const quests: QuestProps[] = [
    {
        name: "Nhắn $1 tin nhắn ở kênh bất kì",
        function: QuestFunction.chat,
        item: items.candy.id,
        rate: generateRate(70, 121),
    },
    {
        name: "Nhắn $1 tin nhắn tại kênh $2",
        function: QuestFunction.chat_channel,
        item: items.candy.id,
        rate: generateRate(50, 101),
        channel: "878311098070228992",
    },
    {
        name: "Treo voice $1 phút",
        function: QuestFunction.voice,
        item: items.candy.id,
        rate: generateRate(1, 2 * 60),
    },
    {
        name: "Mở $1 pack bất kì",
        function: QuestFunction.open,
        item: items.candy.id,
        rate: generateRate(5, 10),
    },
    {
        name: "Mở $1 pack $2",
        function: QuestFunction.open_pack,
        item: items.candy.id,
        rate: generateRate(5, 10),
        pack: packs[ranInt(0, packs.length)] as Pack,
    },
    {
        name: "Nâng cấp thẻ $1 lần (hlw upg <id>)",
        function: QuestFunction.upgrade_card,
        item: items.candy.id,
        rate: generateRate(1, 4),
    },
    {
        name: "Thách đấu thắng $1 người",
        function: QuestFunction.win_battle,
        item: items.candy.id,
        rate: generateRate(3, 6),
    },
    {
        name: "Thách đấu $1 người",
        function: QuestFunction.battle,
        item: items.candy.id,
        rate: generateRate(4, 8)
    }
];

export default quests;
