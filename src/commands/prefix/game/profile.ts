import { resolvePower } from "@/functions/power";
import ErrorInterface from "@/interfaces/error";
import ProfileInterface from "@/interfaces/profile";
import prefix from "@/layouts/prefix";
import { Rank } from "@prisma/client";
import { bold } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "profile",
    {
        description: {
            content: `xem thông tin hồ sơ cá nhân của bạn, bảng xếp hạng cá nhân.`,
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

        let member: any = args[0] && (client.users.cache.get(args[0]) || message.mentions.users.first());

        if (member) {
            member = await client.prisma.user.findUnique({ where: { user_id: member.id }, include: { cards: true } });
            if (!member) {
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Không tìm thấy dữ liệu của người này")],
                });
            }

            user = member;
        }

        const users = await client.prisma.user.findMany({
            where: { card_id: { not: null } },
            include: { cards: true },
        });
        const powers = await Promise.all(users.map((_user) => resolvePower(_user, _user.card_id)));
        const power = resolvePower(user, user.card_id);
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

        const bxh = `<:pnv_bxhev:1293635731503185920> ${bold("BXH")}\n> \`#${await client.utils.getTopPremiumCandy(user)}\` ${bold("Top Kẹo Hắc Ám")}\n> \`#${await client.utils.getWinnerStreak(user)}\` ${bold("Top Chuỗi Thắng")}\n> \`#${topPower.length}\` ${bold("Top Chiến Lực")}`;

        const myCard = card
            ? `<:pnv_star:1293636195674488884> ${bold("Thẻ Bài")}\n> ${client.icons[card.rank]} • \`Lv ${card.level}\` • ${bold(card.name)}\n> ${client.icons.power} Sức Mạnh: ${bold(Intl.NumberFormat().format(power))}`
            : "";

        embed.setDescription(information + "\n\n" + bxh + "\n\n" + myCard);

        return await message.channel.send({ embeds: [embed] });
    },
);
