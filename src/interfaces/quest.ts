import minutesUntilMidnight from "@/functions/timeToMidnight";
import type { Quest } from "@prisma/client";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";
import items from "@/data/items.json";

export default class QuestInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public quests: Omit<Omit<Quest, "quest_id">, "user_id">[],
    ) {
        super({
            color: resolveColor(client.color.main),
            author: {
                name: `${message.member?.nickname || message.author.displayName}`,
                icon_url: message.member?.avatarURL() || message.member?.displayAvatarURL(),
            },
            description: `Quest thuộc về ${message.author.toString()}\n${quests
                .map(({ name, reward_amount, reward_item, progress, target }, index) => {
                    return `${bold(`${index + 1}. ${name}\n\`‣ Phần thưởng\`: ${items[reward_item].icon} x${reward_amount}`)}\n\`‣ Tiến trình: [${progress}/${target}]\``;
                })
                .join("\n")}`,
            footer: { text: `Quest tiếp theo sẽ có trong: ${minutesUntilMidnight()}` },
        });
    }
}
