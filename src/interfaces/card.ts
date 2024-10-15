import getIngredient from "@/functions/getIngredient";
import { getPower } from "@/functions/power";
import getRate from "@/functions/getRate";
import ranColor from "@/helpers/ranColor";
import { bold, EmbedBuilder, Message, resolveColor } from "discord.js";
import type { Card } from "typings";
import type { UserWithCards } from "typings/command";

export default class CardInterface extends EmbedBuilder {
    constructor(
        public client: ExtendedClient,
        public message: Message,
        public user: UserWithCards,
        public card: Card,
    ) {
        const userCard = user.cards.find((f) => f.card_id === card.id);
        const pack = client.packs.find((f) => f.cards.includes(card.id));

        let description;

        if (userCard) {
            const ingredient = getIngredient(userCard.level);

            description = `- Có thể tìm thấy khi mở Pack ${pack?.icon} ${bold(pack!.name)}\n\n<:pnv_star:1293636195674488884> ${bold("Thông Số Thẻ")}\n> - Cấp Bậc: ${client.icons[userCard.rank]} ${bold(`(${getRate(userCard.rank)}%)`)}\n> - Cấp \`${userCard.level}\` (cần ${bold(ingredient.candy.toString())} ${client.items.candy.icon} ${bold(ingredient.soul.toString())} ${client.items.soul.icon} để nâng cấp)\n> - Sức Mạnh: ${bold(Intl.NumberFormat().format(getPower(userCard.rank, userCard.level)))} ${client.icons.power}`;
        } else {
            description = `- Có thể tìm thấy khi mở Pack ${pack?.icon} ${bold(pack!.name)}\n\n<:pnv_star:1293636195674488884> ${bold("Thông Số Thẻ")}\n> - Bạn chưa sở hữu thẻ bài này, đi mở thêm pack đi !`;
        }

        super({
            color: resolveColor(ranColor(client.colors.main)),
            author: {
                name: "Thông Tin Thẻ Bài",
                icon_url: message.guild?.iconURL()!,
            },
            description,
            footer: {
                text: `@${message.author.username} • .gg/phonguoiviet`,
                iconURL: message.author.displayAvatarURL(),
            },
            image: { url: card.image },
            thumbnail: {
                url: "https://cdn-icons-png.flaticon.com/128/14692/14692596.png",
            },
        });
    }
}
