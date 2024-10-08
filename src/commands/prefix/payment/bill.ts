import banks from "@/data/banks.json";
import prefix from "@/layouts/prefix";
import axios from "axios";
import * as CryptoJS from "crypto-js";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import QRCode from "qrcode";
import { Category } from "typings/utils";

export default prefix(
    "bill",
    {
        description: {
            content: "Tạo mã qr.",
            examples: ["bill 10000 chuyển khoản"],
            usage: "bill <số tiền> <nội dung chuyển khoản>",
        },
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        developersOnly: true,
        ignore: false,
        category: Category.info,
    },
    async (client, message, args) => {
        const bankName = process.env.BANKNAME;
        const accountNo = process.env.BANKNO;
        const amount = Number(args.shift());
        const description = args.join(" ");

        const embed = new EmbedBuilder();

        const bank = banks.find((f) => f.shortName === bankName);
        if (!bank) {
            return await message.channel.send({
                embeds: [embed.setColor(client.color.red).setDescription("Không tìm thấy ngân hàng")],
            });
        }

        if (!amount || isNaN(amount) || amount < 5000 || amount > 9999999999999) {
            return await message.channel.send({
                embeds: [embed.setColor(client.color.red).setDescription("Số tiền không hợp lệ")],
            });
        }

        if (!description || description.length > 25) {
            return await message.channel.send({
                embeds: [embed.setColor(client.color.red).setDescription("Nội dung chuyển khoản quá dài")],
            });
        }

        try {
            const payment = await client.prisma.payment.create({
                data: {
                    amount,
                    bank_bin: bank.bin,
                    bank_number: accountNo,
                    create_by: message.author.id,
                    content: description,
                },
            });

            const cancelUrl = `http://server.shirokodev.site:81/confirm`;
            const returnUrl = `http://server.shirokodev.site:81/confirm`;
            const signature = CryptoJS.HmacSHA256(
                `amount=${amount}&cancelUrl=${cancelUrl}&description=${description || "No description provided"}&orderCode=${payment.payment_id}&returnUrl=${returnUrl}`,
                process.env.PAYMENT_CHECKSUM_KEY,
            );

            const res = await axios.post<PayOSCreatePaymentResponse>(
                "https://api-merchant.payos.vn/v2/payment-requests",
                {
                    orderCode: payment.payment_id,
                    amount,
                    description: description || "No description provided",
                    buyerName: "",
                    buyerEmail: "",
                    buyerPhone: "",
                    buyerAddress: "",
                    items: [],
                    cancelUrl,
                    returnUrl,
                    expiredAt: Math.round(Date.now() / 1000) + 15 * 60_000,
                    signature: signature.toString(CryptoJS.enc.Hex),
                },
                {
                    headers: {
                        "x-client-id": process.env.PAYMENT_CLIENT_ID,
                        "x-api-key": process.env.PAYMENT_API_KEY,
                    },
                },
            );

            if (res.data.code === "00" && res.data.data?.qrCode) {
                const qrcode = await QRCode.toBuffer(res.data.data.qrCode, { width: 500 });

                const attachment = new AttachmentBuilder(qrcode, { name: "qrcode.png" });

                await message.channel.send({
                    files: [attachment],
                });

                await message.react(client.emoji.done);
            } else {
                console.log(res.data);
                return await message.channel.send({
                    embeds: [embed.setColor(client.color.red).setDescription("Đã xảy ra lỗi: " + "không xác định")],
                });
            }
        } catch (error: any) {
            console.log(error);
            return await message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color.red)
                        .setDescription("Đã xảy ra lỗi: " + (error?.response?.data?.desc || "không xác định")),
                ],
            });
        }
    },
);
