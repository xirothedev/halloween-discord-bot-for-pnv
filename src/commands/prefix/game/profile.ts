import ProfileInterface from "@/interfaces/profile";
import prefix from "@/layouts/prefix";
import { Rank } from "@prisma/client";
import { bold } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "profile",
    {
        description: {
            content: "Xem thông tin người dùng.",
            examples: ["profile"],
            usage: "profile",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const embed = new ProfileInterface(client, message, user);

        const users = await client.prisma.user.findMany({
            where: { card_id: { not: null } },
            include: { cards: true },
        });
        const powers = await Promise.all(users.map((_user) => client.utils.getTopPower(_user, user)));
        const power = await client.utils.getTopPower(user, user);
        const topPower = powers.filter((f) => f > power);

        const totalBCard = user.cards.filter((f) => f.rank === Rank.b_rank).reduce((acc, cur) => acc + cur.quantity, 0);
        const totalACard = user.cards.filter((f) => f.rank === Rank.a_rank).reduce((acc, cur) => acc + cur.quantity, 0);
        const totalRCard = user.cards.filter((f) => f.rank === Rank.r_rank).reduce((acc, cur) => acc + cur.quantity, 0);
        const totalSRCard = user.cards
            .filter((f) => f.rank === Rank.sr_rank)
            .reduce((acc, cur) => acc + cur.quantity, 0);
        const totalSCard = user.cards.filter((f) => f.rank === Rank.s_rank).reduce((acc, cur) => acc + cur.quantity, 0);

        const card = user.cards.find((f) => f.card_id === user.card_id);

        if (card) {
            embed.setImage(card.image);
        }

        const information = `<:pnv_viewpack:1293634668725534852> ${bold("Thông Tin")}\n> - Số pack đã mở: ${bold(user.total_pack.toString())}\n> - ${client.icons.b_rank} ${bold(`x${totalBCard}`)}, ${client.icons.a_rank} ${bold(`x${totalACard}`)}, ${client.icons.r_rank} ${bold(`x${totalRCard}`)}, ${client.icons.sr_rank} ${bold(`x${totalSRCard}`)}, ${client.icons.s_rank} ${bold(`x${totalSCard}`)}`;

        const bxh = `<:pnv_bxhev:1293635731503185920> ${bold("BXH")}\n> \`#${await client.utils.getTopPremiumCandy(user)}\` ${bold("Top Kẹo Xanh")}\n> \`#${await client.utils.getWinnerStreak(user)}\` ${bold("Top Chuỗi Thắng")}\n> \`#${topPower.length}\` ${bold("Top Lực Chiến")}`;

        const myCard = card
            ? `<:pnv_star:1293636195674488884> ${bold("Thẻ Bài")}\n> ${client.icons[card.rank]} • \`Lv ${card.level}\` • ${bold(card.name)}\n> <:pnv_power:1293636491637162066> Sức Mạnh: ${bold(Intl.NumberFormat().format(power))}`
            : "";

        embed.setDescription(information + "\n" + bxh + "\n" + myCard);

        return await message.channel.send({ embeds: [embed] });
    },
);
