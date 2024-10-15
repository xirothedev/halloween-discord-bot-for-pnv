import { resolvePower } from "@/functions/power";
import BxhInterface, { BaseBxhInterface } from "@/interfaces/bxh";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessagePayload,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    type APIEmbed,
    type MessageReplyOptions,
} from "discord.js";
import { Category } from "typings/utils";

type Type = "candy" | "premium_candy" | "power" | null;

export default prefix(
    "bxh",
    {
        description: {
            content: "Xem bảng xếp hạng.",
            examples: ["bxh"],
            usage: "bxh",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const users = await client.prisma.user.findMany({
            where: { card_id: { not: null } },
            include: { cards: true },
        });
        const powers = users.map((_user) => ({ number: resolvePower(user, user.card_id), user: _user }));
        const power = resolvePower(user, user.card_id);
        const topPower = powers.filter((f) => f.number > power);

        const prevButton = new ButtonBuilder({
            customId: "previous",
            label: "Trang trước",
            style: ButtonStyle.Primary,
        });
        const nextButton = new ButtonBuilder({ customId: "next", label: "Trang sau", style: ButtonStyle.Primary });

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            prevButton.setDisabled(true),
            nextButton.setDisabled(false),
        );

        const select = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
            new StringSelectMenuBuilder({ customId: "select", placeholder: "Chọn bảng xếp hạng" }).addOptions(
                new StringSelectMenuOptionBuilder({
                    label: "Kẹo Cam",
                    value: "candy",
                    emoji: client.items.candy.icon,
                }),
                new StringSelectMenuOptionBuilder({
                    label: "Kẹo Hắc Ám",
                    value: "premium_candy",
                    emoji: client.items.premium_candy.icon,
                }),
                new StringSelectMenuOptionBuilder({
                    label: "Điểm chiến lực",
                    value: "power",
                    emoji: client.icons.power,
                }),
            ),
        );

        const ranks = [
            `   • ${client.items.candy.icon} Top Kẹo Cam \`#${await client.utils.getTopCandy(user)}\``,
            `   • ${client.items.premium_candy.icon} Top Kẹo Hắc Ám \`#${await client.utils.getTopPremiumCandy(user)}\``,
            `   • ${client.items.candy.icon} Top Sức Mạnh \`#${topPower.length}\``,
        ];

        let page = 1;
        let type: Type;
        let maxpage = 1;

        const msg = await message.channel.send({
            embeds: [new BxhInterface(client, message, ranks)],
            components: [select],
        });

        const getIcon = (index: number) => {
            let icon;

            if (page === 1) {
                if (index === 0) {
                    icon = "<:pnv_medal1:1041704516241858601>";
                } else if (index === 1) {
                    icon = "<:pnv_medal2:1041704562345656360>";
                } else if (index === 2) {
                    icon = "<:pnv_medal3:1041704609774846023>";
                } else if (index === 3) {
                    icon = "<:pnv_medal4:1041704661138276362>";
                } else {
                    icon = `#${index + 1}`;
                }
            } else {
                icon = `#${index + 1}`;
            }

            return icon;
        };

        const getInterface = async (page: number) => {
            if (type === "candy") {
                maxpage = await client.prisma.user.count({ where: { NOT: { candy: 0 } } });
                const datas = await client.prisma.user.findMany({
                    take: 10,
                    skip: 10 * (page - 1),
                    orderBy: { candy: "desc" },
                });

                const format = datas.map((data, index) => {
                    const member = client.users.cache.get(data.user_id);

                    return `${getIcon(index)} \`${member?.username}\`: \`${data.candy}\` ${client.items.candy.icon}`;
                });

                return new BaseBxhInterface(client, message, format);
            } else if (type === "premium_candy") {
                maxpage = await client.prisma.user.count({ where: { NOT: { premium_candy: 0 } } });
                const datas = await client.prisma.user.findMany({
                    take: 10,
                    skip: 10 * (page - 1),
                    orderBy: { premium_candy: "desc" },
                });

                const format = datas.map((data, index) => {
                    const member = client.users.cache.get(data.user_id);

                    return `${getIcon(index)} \`${member?.username}\`: \`${data.premium_candy}\` ${client.items.premium_candy.icon}`;
                });

                return new BaseBxhInterface(client, message, format);
            } else if (type === "power") {
                maxpage = await client.prisma.user.count({ where: { NOT: { card_id: null } } });
                const format = powers
                    .sort((a, b) => a.number - b.number)
                    .map((pow, index) => {
                        const member = client.users.cache.get(pow.user.user_id);

                        return `${getIcon(index)} \`${member?.username}\`: \`${Intl.NumberFormat().format(pow.number)}\` ${client.icons.power}`;
                    });

                return new BaseBxhInterface(client, message, format);
            } else {
                return new BxhInterface(client, message, ranks);
            }
        };

        const collector = await msg.createMessageComponentCollector({
            filter: (f) => f.user.id === message.author.id,
            time: 5 * 60_000,
        });

        collector.on("collect", async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.customId === "select" && interaction.isStringSelectMenu()) {
                type = interaction.values[0] as Type;

                const embed = await getInterface(page);

                await msg.edit({
                    embeds: [embed],
                    components: [row.setComponents(prevButton.setDisabled(true), nextButton.setDisabled(false))],
                });
            } else if (interaction.customId === "previous") {
                if (page <= 1) {
                    return await interaction.followUp({
                        embeds: [new ErrorInterface(client).setDescription("Trang này là trang đầu tiên")],
                        ephemeral: true,
                    });
                }

                page--;

                const options: MessageReplyOptions = { embeds: [await getInterface(page)] };

                if (page <= 1) {
                    options.components = [
                        row.setComponents(prevButton.setDisabled(true), nextButton.setDisabled(false)),
                    ];
                } else {
                    options.components = [
                        row.setComponents(prevButton.setDisabled(false), nextButton.setDisabled(false)),
                    ];
                }

                await msg.edit({ embeds: options.embeds, components: options.components });
            } else {
                if (page >= 6) {
                    return await interaction.followUp({
                        embeds: [new ErrorInterface(client).setDescription("Trang này là trang cuối cùng")],
                        ephemeral: true,
                    });
                }

                page++;

                const options: string | MessagePayload | MessageReplyOptions = { embeds: [await getInterface(page)] };

                if (page >= maxpage) {
                    options.components = [
                        row.setComponents(prevButton.setDisabled(false), nextButton.setDisabled(true)),
                    ];
                } else {
                    options.components = [
                        row.setComponents(prevButton.setDisabled(false), nextButton.setDisabled(false)),
                    ];
                }

                await msg.edit({ embeds: options.embeds, components: options.components });
            }
        });

        collector.on("end", async (collected, reason) => {
            await msg.edit({ components: [] });
        });
    },
);
