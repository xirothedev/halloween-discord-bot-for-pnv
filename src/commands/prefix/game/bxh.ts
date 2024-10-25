import { resolvePower } from "@/functions/power";
import BxhInterface, { BaseBxhInterface } from "@/interfaces/bxh";
import prefix from "@/layouts/prefix";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { Category } from "typings/utils";

type Type = "candy" | "premium_candy" | "power" | "winner" | null;

export default prefix(
    "bxh",
    {
        description: {
            content: `Xem bảng xếp hạng Kẹo Cam, Kẹo Hắc Ám, Sức mạnh.`,
            examples: ["bxh"],
            usage: "bxh",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        category: Category.game,
    },
    async (client, user, message, args) => {
        const users = await client.prisma.user.findMany({
            where: { card_id: { not: null } },
            include: { cards: true },
        });
        const powers = users.map((_user) => ({ number: resolvePower(_user, _user.card_id), user: _user }));
        const power = resolvePower(user, user.card_id);
        const topPower = powers.filter((f) => f.number > power);

        let page = 1;
        let type: Type = null;
        let maxPage = 1;

        const prevButton = new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("Trang trước")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const nextButton = new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Trang sau")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);

        const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("select")
                .setPlaceholder("Chọn bảng xếp hạng")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Kẹo Cam")
                        .setValue("candy")
                        .setEmoji(client.items.candy.icon),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Kẹo Hắc Ám")
                        .setValue("premium_candy")
                        .setEmoji(client.items.premium_candy.icon),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Sức mạnh")
                        .setValue("power")
                        .setEmoji(client.icons.power),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Chuỗi thắng")
                        .setValue("winner")
                        .setEmoji("<a:pnv_winstreak:1295079654473990214>"),
                ),
        );

        const ranks = [
            `   • ${client.items.candy.icon} Top Kẹo Cam \`#${(await client.utils.getTopCandy(user)) + 1}\``,
            `   • ${client.items.premium_candy.icon} Top Kẹo Hắc Ám \`#${(await client.utils.getTopPremiumCandy(user)) + 1}\``,
            `   • ${client.icons.power} Top Sức Mạnh \`#${topPower.length + 1}\``,
            `   • <a:pnv_winstreak:1295079654473990214> Top Chuỗi Thắng \`#${(await client.utils.getTopWinnerStreak(user)) + 1}\``,
        ];

        const msg = await message.channel.send({
            embeds: [new BxhInterface(client, message, ranks)],
            components: [selectMenu],
        });

        const getIcon = (index: number) => {
            const overallIndex = (page - 1) * 10 + index;

            if (page === 1 && index < 3) {
                const medals = [
                    "<:pnv_medal1:1041704516241858601>",
                    "<:pnv_medal2:1041704562345656360>",
                    "<:pnv_medal3:1041704609774846023>",
                ];
                return medals[index];
            }

            return `#${overallIndex + 1}`;
        };

        const getInterface = async (page: number, type: Type) => {
            if (!type) return new BxhInterface(client, message, ranks);

            let countField: string | undefined;
            let orderField: string;
            let format;

            switch (type) {
                case "candy":
                    countField = "candy";
                    orderField = "candy";
                    break;
                case "premium_candy":
                    countField = "premium_candy";
                    orderField = "premium_candy";
                    break;
                case "winner":
                    countField = "streak_winner";
                    orderField = "streak_winner";
                    break;
                case "power":
                    countField = undefined;
                    break;
            }

            if (type === "power") {
                maxPage = Math.ceil(powers.length / 10);

                format = powers
                    .sort((a, b) => b.number - a.number)
                    .slice(10 * (page - 1), 10 * page)
                    .map((pow, index) => {
                        const member = client.users.cache.get(pow.user.user_id);
                        return `${getIcon(index)} \`${member?.username}\`: \`${Intl.NumberFormat().format(pow.number)}\` ${client.icons.power}`;
                    });
            } else {
                const totalUsers = await client.prisma.user.count();
                maxPage = Math.ceil(totalUsers / 10);

                const datas = await client.prisma.user.findMany({
                    take: 10,
                    skip: 10 * (page - 1),
                    orderBy: { [orderField!]: "desc" },
                });

                format = datas.map((data: any, index) => {
                    const member = client.users.cache.get(data.user_id);
                    return `${getIcon(index)} \`${member?.username}\`: \`${Intl.NumberFormat().format(+data[orderField])}\` ${client.items[type!]?.icon || "<a:pnv_winstreak:1295079654473990214>"}`;
                });
            }

            return new BaseBxhInterface(client, message, format);
        };

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 5 * 60_000,
        });

        collector.on("collect", async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.isStringSelectMenu()) {
                type = interaction.values[0] as Type;
                page = 1;

                const embed = await getInterface(page, type);
                await msg.edit({
                    embeds: [embed],
                    components: [
                        selectMenu,
                        row.setComponents(prevButton.setDisabled(true), nextButton.setDisabled(maxPage <= 1)),
                    ],
                });
            } else if (interaction.isButton()) {
                if (interaction.customId === "previous") page--;
                if (interaction.customId === "next") page++;

                const embed = await getInterface(page, type);
                await msg.edit({
                    embeds: [embed],
                    components: [
                        selectMenu,
                        row.setComponents(prevButton.setDisabled(page <= 1), nextButton.setDisabled(page >= maxPage)),
                    ],
                });
            }
        });

        collector.on("end", async () => {
            await msg.edit({ components: [] });
        });
    },
);
