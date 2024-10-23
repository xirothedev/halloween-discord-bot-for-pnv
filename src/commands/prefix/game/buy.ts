import items from "@/data/items.json";
import ranColor from "@/helpers/ranColor";
import ErrorInterface from "@/interfaces/error";
import prefix from "@/layouts/prefix";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Message,
    type ComponentEmojiResolvable,
} from "discord.js";
import type { Pack } from "typings";
import type { FullUser } from "typings/command";
import { Category } from "typings/utils";

const COST_CANDY = 30;
const COST_PREMIUM_CANDY = 3;
const SOUL_BOX_COST = 5;

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

        if (isSoulBox(args[0], client)) {
            return handleSoulBoxPurchase(client, user, message, amount);
        }

        const pack = findPack(client, args);
        if (!pack) {
            return message.channel.send({
                embeds: [new ErrorInterface(client).setDescription("Không tìm thấy vật phẩm")],
            });
        }

        const candyButton = createButton(
            "candy",
            ButtonStyle.Primary,
            `x${amount * 25} Kẹo cam`,
            client.items.candy.icon,
        );
        const premiumCandyButton = createButton(
            "premium_candy",
            ButtonStyle.Primary,
            `x${amount * 3} Kẹo hắc ám`,
            client.items.premium_candy.icon,
        );

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(candyButton, premiumCandyButton);

        const msg = await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`Bạn muốn mua **x${amount}** vật phẩm \`${pack.name}\` bằng loại kẹo nào?`)
                    .setColor(ranColor(client.colors.main)),
            ],
            components: [row],
        });

        const collector = msg.createMessageComponentCollector({
            filter: (f) => f.user.id === message.author.id,
            time: 60_000,
        });

        collector.on("collect", async (i) => {
            await i.deferUpdate();
            if (i.customId === "candy") {
                return handlePurchase(client, user, msg, "candy", COST_CANDY, amount, pack);
            } else if (i.customId === "premium_candy") {
                return handlePurchase(client, user, msg, "premium_candy", COST_PREMIUM_CANDY, amount, pack);
            }
        });

        collector.on("end", () => {
            msg.edit({
                components: [row.setComponents(candyButton.setDisabled(true), premiumCandyButton.setDisabled(true))],
            });
        });
    },
);

// Hàm xử lý mua soul_box
async function handleSoulBoxPurchase(client: ExtendedClient, user: FullUser, message: Message<true>, amount: number) {
    if (user.premium_candy < SOUL_BOX_COST * amount) {
        return message.channel.send({
            embeds: [new ErrorInterface(client).setDescription("Bạn không có đủ " + client.items.premium_candy.icon)],
        });
    }

    await client.prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            premium_candy: { decrement: SOUL_BOX_COST * amount },
            soul_box: { increment: amount },
        },
    });

    return message.channel.send({
        content: `${client.emoji.done} | Đã mua thành công`,
    });
}

// Hàm tìm kiếm pack dựa trên id hoặc tên
function findPack(client: ExtendedClient, args: string[]) {
    return client.packs.find(
        (f) =>
            f.id === args[0] ||
            f.name.toLowerCase() === args.join(" ").toLowerCase() ||
            f.name
                .split(" ")
                .map((m) => m.slice(0, 1))
                .join("")
                .toLowerCase() === args[0].toLowerCase(),
    );
}

// Hàm tạo button
function createButton(id: string, style: ButtonStyle, label: string, emoji: ComponentEmojiResolvable) {
    return new ButtonBuilder().setCustomId(id).setStyle(style).setLabel(label).setEmoji(emoji);
}

// Hàm kiểm tra soul_box
function isSoulBox(arg: string, client: ExtendedClient) {
    return (
        arg === client.items.soul_box.id ||
        arg === "sb" ||
        arg.toLowerCase() === client.items.soul_box.name.toLowerCase()
    );
}

// Hàm xử lý mua pack
async function handlePurchase(
    client: ExtendedClient,
    user: FullUser,
    msg: Message<true>,
    currencyType: keyof FullUser,
    cost: number,
    amount: number,
    pack: Pack,
) {
    const currency = user[currencyType];

    if (!currency || typeof currency !== "number") return;

    if (currency < cost * amount) {
        return msg.channel.send({
            embeds: [new ErrorInterface(client).setDescription(`Bạn không có đủ ${client.items[currencyType].icon}`)],
        });
    }

    await client.prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            [currencyType]: { decrement: cost * amount },
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
        embeds: [],
        components: [],
    });
}
