import timeUntilNextReset from "@/functions/timeUntilNextReset";
import ranColor from "@/helpers/ranColor";
import type { Quest } from "@prisma/client";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";

export default class QuestInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public quests: Omit<Quest, "quest_id" | "user_id">[],
    ) {
        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: "Nhiệm Vụ Halloween",
                icon_url: message.guild?.iconURL()!,
            },
            description: `<:pnv_chamvang:1065567091090014208> Nhiệm vụ sẽ được reset sau: ${bold(timeUntilNextReset())}\n\n${quests
                .map(({ name, reward_amount, reward_item, progress, target }, index) => {
                    return `<a:pnv_pumpkinlaugh:1032767073874620447> ${bold(`${name}`)}\n> <:pnv_chamcam:1293566504524185642> \`Phần thưởng\`: ${client.items[reward_item].icon} ${bold(`x${reward_amount}`)}\n> <:pnv_chamcam:1293566504524185642> \`Tiến trình:\` ${bold(`[${progress}/${target}]`)}`;
                })
                .join("\n\n")}`,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: { url: "https://cdn-icons-png.flaticon.com/128/6028/6028793.png" },
        });
    }
}
