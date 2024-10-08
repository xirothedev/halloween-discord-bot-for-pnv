import event from "@/layouts/event";
import { formatISO9075 } from "date-fns";
import { codeBlock, EmbedBuilder, type TextChannel } from "discord.js";

export default event("bdsd", { once: false }, async (client, body) => {
    const channel = (await client.channels.cache.get(process.env.BDSD_CHANNEL_ID)) as TextChannel;
    if (!channel) return;

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle("Biến động số dư")
                .setDescription(
                    codeBlock(
                        `Tài khoản thụ hưởng: ${body.data.accountNumber}\nMã tham chiếu: ${body.data.reference}\nSố tiền: ${body.data.amount} ${body.data.currency}\nMô tả: ${body.data.description}\nThời gian: ${formatISO9075(new Date(body.data.transactionDateTime))}\nMã đặt hàng: ${body.data.orderCode}`,
                    ),
                )
                .setColor(client.color.green)
                .setTimestamp(),
        ],
    });
});
