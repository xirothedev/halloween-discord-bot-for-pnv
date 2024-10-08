import type { ColorResolvable } from "discord.js";

const config = {
    preconnect: true,
    users: {
        ownerId: "1291013382849167542",
        devIds: ["1291013382849167542", "363285735140491285"],
    },
    publicCommand: true,
    deleteErrorAfter: "5s",
    emoji: {
        done: "✅",
        page: {
            last: "⏩",
            first: "⏪",
            back: "⬅️",
            next: "➡️",
            cancel: "⏹️",
            shuffle: "🔀",
        },
    },
    icons: {} as { [key: string]: string },
    color: {
        red: 0xff0000,
        green: 0x00ff00,
        blue: 0x0000ff,
        yellow: 0xffff00,
        main: 0x2f3136,
    } as { [key: string]: ColorResolvable },
};

export default config;
