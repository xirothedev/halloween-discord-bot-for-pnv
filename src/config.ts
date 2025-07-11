import type { ColorResolvable } from "discord.js";

const config = {
    preconnect: true,
    users: {
        ownerId: "523708248600346635",
        devIds: ["1291013382849167542", "523708248600346635"],
    },
    publicCommand: true,
    deleteErrorAfter: "5s",
    emoji: {
        done: "<a:pnv_thanhcong:1295093705040203937>",
        page: {
            last: "⏩",
            first: "⏪",
            back: "⬅️",
            next: "➡️",
            cancel: "⏹️",
            shuffle: "🔀",
        },
    },
    icons: {
        b_rank: "<:pnv_B:1293614451408240751>",
        a_rank: "<:pnv_A:1293614453677490186>",
        r_rank: "<:pnv_R:1293614458706333776>",
        sr_rank: "<:pnv_SR:1293615184027451473>",
        s_rank: "<:pnv_S:1293614468885905488>",
        hellpack: "<:pnv_chamcam:1293566504524185642>",
        power: "<:pnv_power:1293636491637162066>",
    },
    color: {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff,
        yellow: 0xffff00,
    } as { [key: string]: ColorResolvable },
    colors: {
        main: ["#ffa500", "#a500ff"],
    } as { [key: string]: ColorResolvable[] },
};

export default config;
