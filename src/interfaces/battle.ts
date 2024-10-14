import getPower from "@/functions/getBasePower";
import ranInt from "@/helpers/ranInt";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";
import type { UserWithCards } from "typings/command";

export default class BattleInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: UserWithCards,
        public enemy: UserWithCards,
        public won: boolean | null,
    ) {
        const UserCard = user.cards.find((f) => f.card_id === user.card_id)!;
        const EnemyCard = user.cards.find((f) => f.card_id === user.card_id)!;
        const userEnemy = client.users.cache.get(enemy.user_id);

        const thumbnail =
            won === true
                ? "https://cdn.discordapp.com/attachments/1293487762753982478/1295079400576126996/1.png?ex=670e00ee&is=670caf6e&hm=0bc6e1d324afa0655c6a49507586fa0be9347195ca4b5d2cd0ebe232edaf1a88&"
                : won === false
                  ? "https://cdn.discordapp.com/attachments/1293487762753982478/1295079400773128295/2.png?ex=670e00ee&is=670caf6e&hm=487351a89810023dfbc3140f689ed24ec63d4c926e2ef3ccba82b0cd8570bc6b&"
                  : "https://cdn.discordapp.com/attachments/1293487762753982478/1295079400987033712/3.png?ex=670e00ee&is=670caf6e&hm=864baaba643c01ba03ab5b60a2b4db59cf769a8221423fca252f2f08cc53fa43&";

        const reward: { candy: number; soul: number } = { candy: 0, soul: 0 };

        if (won) {
            reward.candy = ranInt(1, 21) + user.streak_winner * 3;
            reward.soul = ranInt(1, 6) + user.streak_winner * 3;
        }

        super({
            color: won === true ? resolveColor("Green") : won === false ? resolveColor("Red") : undefined,
            author: {
                name: `Thách Đấu Với @${userEnemy?.username}`,
                icon_url: message.guild?.iconURL()!,
            },
            fields: [
                {
                    name: `@${message.author.username}`,
                    value: `${client.icons[UserCard.rank]} • \`Lv ${UserCard.level}\` • ${bold(UserCard.name)}\n<:pnv_power:1293636491637162066> Sức mạnh ${bold(Intl.NumberFormat().format(getPower(UserCard.rank, UserCard.level)))}`,
                    inline: true,
                },
                {
                    name: `@${userEnemy?.username || "Người bí ẩn"}`,
                    value: `${client.icons[EnemyCard.rank]} • \`Lv ${EnemyCard.level}\` • ${bold(EnemyCard.name)}\n<:pnv_power:1293636491637162066> Sức mạnh ${bold(Intl.NumberFormat().format(getPower(EnemyCard.rank, EnemyCard.level)))}`,
                    inline: true,
                },
                {
                    name: "\u200B",
                    value: `- Chuỗi thắng <a:pnv_winstreak:1295079654473990214> ${bold(user.streak_winner.toString())}\n- Bạn nhận được ${bold(`x${reward.candy}`)} ${client.items.candy.icon} ${bold(`x${reward.soul}`)} ${client.items.soul.icon}`,
                    inline: false,
                },
            ],
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: { url: thumbnail },
        });
    }
}
