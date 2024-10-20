import BstInterface, { BaseBstCardInterface } from "@/interfaces/bst";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessagePayload, type MessageReplyOptions } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "bst",
    {
        description: {
            content: `xem bộ sưu tập Card đã có, các Pack đã hoàn thành, số lượng Kẹo Cam, Kẹo Hắc Ám, Linh Hồn.`,
            examples: ["bst"],
            usage: "bst",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
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

        let page = 1;
        const maxpage = client.packs.length + 1;

        const msg = await message.channel.send({
            embeds: [new BstInterface(client, message, user)],
            components: [row],
        });

        const getInterface = (page: number) => {
            if (page === 1) {
                return new BstInterface(client, message, user);
            } else {
                return new BaseBstCardInterface(client, message, user, client.packs[page - 2]);
            }
        };

        const collector = await msg.createMessageComponentCollector({
            filter: (f) => f.user.id === message.author.id,
            time: 5 * 60_000,
        });

        collector.on("collect", async (interaction) => {
            await interaction.deferUpdate();

            if (interaction.customId === "previous") {
                if (page <= 1) {
                    return await interaction.followUp({
                        embeds: [new ErrorInterface(client).setDescription("Trang này là trang đầu tiên")],
                        ephemeral: true,
                    });
                }

                page--;

                const options: MessageReplyOptions = { embeds: [getInterface(page)] };

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

                const options: string | MessagePayload | MessageReplyOptions = { embeds: [getInterface(page)] };

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
