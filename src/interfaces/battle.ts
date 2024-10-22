import { getPower } from "@/functions/power";
import ranInt from "@/helpers/ranInt";
import type { Card } from "@prisma/client";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";
import type { UserWithCards } from "typings/command";

export default class BattleInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: UserWithCards,
        public enemyCard: Card,
        public won: boolean | null,
        public reward: { candy: number; soul: number },
    ) {
        const UserCard = user.cards.find((f) => f.card_id === user.card_id)!;;
        const userEnemy = client.users.cache.get(enemyCard.user_id);

        const thumbnail =
            won === true
                ? "https://cdn.discordapp.com/attachments/1293978154163114115/1297985508684857515/win.png?ex=6717eab4&is=67169934&hm=eb5d820352b7fb705684254c40cd5497c2c03f16df3dfd4deab307eb434fd907&"
                : won === false
                  ? "https://cdn.discordapp.com/attachments/1293978154163114115/1297985509238374400/lose.png?ex=6717eab4&is=67169934&hm=e2cd7aa3bf4eeb7ab081b0645bc73b9a897c18c2cb1b281daa4828f89886948f&"
                  : "https://cdn.discordapp.com/attachments/1293978154163114115/1297985508198187028/draw.png?ex=6717eab4&is=67169934&hm=7c28605e939116d055072b42137a94f1aa9937799dd0209eb5e516caf00f7fef&";

        super({
            color: won === true ? resolveColor("Green") : won === false ? resolveColor("Red") : undefined,
            author: {
                name: `Thách Đấu Với @${userEnemy?.username}`,
                icon_url: message.guild?.iconURL()!,
            },
            fields: [
                {
                    name: `@${message.author.username}`,
                    value: `${client.icons[UserCard.rank]} • \`Lv ${UserCard.level}\` • ${bold(UserCard.name)} <:pnv_versus:1296125524330020975>\n${client.icons.power} Sức mạnh ${bold(Intl.NumberFormat().format(getPower(UserCard.rank, UserCard.level)))}`,
                    inline: true,
                },
                {
                    name: `@${userEnemy?.username || "Người bí ẩn"}`,
                    value: `${client.icons[enemyCard.rank]} • \`Lv ${enemyCard.level}\` • ${bold(enemyCard.name)}\n${client.icons.power} Sức mạnh ${bold(Intl.NumberFormat().format(getPower(enemyCard.rank, enemyCard.level)))}`,
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
