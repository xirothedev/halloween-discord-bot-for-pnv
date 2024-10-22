import items from "@/data/items.json";
import ranColor from "@/helpers/ranColor";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "buy",
    {
        description: {
            content: `Mua các vật phẩm sự kiện tại cửa hàng Halloween bằng ${items.candy.icon} và ${items.premium_candy.icon}.`,
            examples: ["buy 1 Urban Legends", "buy 2 tot"],
            usage: "buy <số lượng> <id/tên vật phẩm>",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.game,
    },
    async (client, user, message, args) => {
        const amount = Number(args.shift());

        if (!amount || isNaN(amount)) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp số lượng cần mua")],
            });
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Bạn phải cung cấp id card")],
            });
        }

        // code tạm
        if (
            args[0] === client.items.soul_box.id ||
            args[0] === "sb" ||
            args.join(" ").toLowerCase() === client.items.soul_box.name.toLowerCase()
        ) {
            if (user.candy < 5 * amount) {
                return message.channel.send({
                    embeds: [new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.candy.icon)],
                });
            }

            await client.prisma.user.update({
                where: { user_id: user.user_id },
                data: {
                    premium_candy: { decrement: 5 * amount },
                    soul_box: { increment: amount },
                },
            });

            return message.channel.send({
                content: `${client.emoji.done} | Đã mua thành công`,
            });
        }

        const pack = client.packs.find(
            (f) =>
                f.id === args[0] ||
                f.name.toLowerCase() === args.join(" ").toLowerCase() ||
                f.name
                    .split(" ")
                    .map((m) => m.slice(0, 1))
                    .join("")
                    .toLowerCase() === args[0].toLowerCase(),
        );

        if (!pack) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy vật phẩm")],
            });
        }

        const candy = new ButtonBuilder()
            .setCustomId("candy")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Kẹo cam")
            .setEmoji(client.items.candy.icon);
        const premiumCandy = new ButtonBuilder()
            .setCustomId("premium_candy")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Kẹo hắc ám")
            .setEmoji(client.items.premium_candy.icon);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(candy, premiumCandy);

        const msg = await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Bạn muốn mua **x${amount}** vật phẩm ${pack.name} bằng loại kẹo nào?`)
                    .setColor(ranColor(client.colors.main)),
            ],
            components: [row],
        });

        const collector = await msg.createMessageComponentCollector({
            filter: (f) => f.user.id === message.author.id,
            time: 60_000,
        });

        collector.on("collect", async (i) => {
            await i.deferUpdate();
            if (i.customId === "candy") {
                if (user.candy < 25 * amount) {
                    return message.channel.send({
                        embeds: [
                            new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.candy.icon),
                        ],
                    });
                }

                await client.prisma.user.update({
                    where: { user_id: user.user_id },
                    data: {
                        candy: { decrement: 25 * amount },
                        packs: {
                            upsert: {
                                where: { pack_id_user_id: { pack_id: pack.id, user_id: user.user_id } },
                                update: { quantity: { increment: amount } },
                                create: { pack_id: pack.id, quantity: amount },
                            },
                        },
                    },
                });

                return msg.edit({
                    content: `${client.emoji.done} | Đã mua thành công`,
                    components: [
                        row.setComponents(
                            candy.setStyle(ButtonStyle.Success).setDisabled(true),
                            premiumCandy.setDisabled(true),
                        ),
                    ],
                });
            } else if (i.customId === "premium_candy") {
                if (user.candy < 3 * amount) {
                    return message.channel.send({
                        embeds: [
                            new ErrorInterface(client).setDescription(
                                "Bạn không có đủ " + client.items.premium_candy.icon,
                            ),
                        ],
                    });
                }

                await client.prisma.user.update({
                    where: { user_id: user.user_id },
                    data: {
                        premium_candy: { decrement: 3 * amount },
                        packs: {
                            upsert: {
                                where: { pack_id_user_id: { pack_id: pack.id, user_id: user.user_id } },
                                update: { quantity: { increment: amount } },
                                create: { pack_id: pack.id, quantity: amount },
                            },
                        },
                    },
                });

                return msg.edit({
                    content: `${client.emoji.done} | Đã mua thành công`,
                    components: [
                        row.setComponents(
                            candy.setDisabled(true),
                            premiumCandy.setStyle(ButtonStyle.Success).setDisabled(true),
                        ),
                    ],
                });
            }
        });

        collector.on("end", (collected, reason) => {
            return msg.edit({
                components: [row.setComponents(candy.setDisabled(true), premiumCandy.setDisabled(true))],
            });
        });
    },
);
