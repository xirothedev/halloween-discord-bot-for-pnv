import ranColor from "@/helpers/ranColor";
import prefix from "@/layouts/prefix";
import { EmbedBuilder } from "discord.js";
import { Category } from "typings/utils";

export default prefix(
    "help",
    {
        description: {
            content: "Hiển thị menu trợ giúp.",
            examples: ["help"],
            usage: "help",
        },
        aliases: ["h"],
        cooldown: "5s",
        botPermissions: ["SendMessages", "ReadMessageHistory", "ViewChannel", "EmbedLinks"],
        ignore: false,
        category: Category.info,
    },
    async (client, user, message, args) => {
        const embed = new EmbedBuilder();
        const commands = client.collection.prefixcommands.filter((f) => !f.options.hidden && !f.options.ignore);
        const categories = [...new Set(commands.map((cmd) => cmd.options.category))];

        if (args[0]) {
            const command = client.collection.prefixcommands.get(args[0].toLowerCase());
            if (!command) {
                return await message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color.red)
                            .setDescription(`Lệnh \`${args[0]}\` này không tồn tại.`),
                    ],
                });
            }
            const helpEmbed = embed
                .setColor(ranColor(client.colors.main))
                .setTitle(`Menu trợ giúp - ${command.name}`)
                .setDescription(
                    `**Mô tả:** ${command.options.description.content}\n**Cách sử dụng:** ${client.prefix} ${
                        command.options.description.usage
                    }\n**Ví dụ:** ${command.options.description.examples
                        .map((example: string) => `${client.prefix} ${example}`)
                        .join(", ")}\n**Biệt danh:** ${
                        command.options.aliases?.map((alias: string) => `\`${alias}\``).join(", ") || "Không có"
                    }`,
                );
            return await message.channel.send({ embeds: [helpEmbed] });
        }

        const fields = categories.map((category) => ({
            name: category,
            value: commands
                .filter((cmd) => cmd.options.category === category)
                .map((cmd) => `\`${cmd.name}\``)
                .join(", "),
            inline: false,
        }));

        const helpEmbed = embed
            .setColor(ranColor(client.colors.main))
            .setTitle("Menu trợ giúp")
            .setDescription(
                `
                Chào bạn! Tôi là ${client.user?.displayName}, một bot sự kiện Halloween được tạo bởi Phố Người Việt. Bạn có thể sử dụng \`${client.prefix} help <command>\` để biết thêm thông tin về lệnh.
                > Để được hỗ trợ, vui lòng đăng post tại kênh <#1299375688234700880>
                `,
            )
            .setFooter({
                text: `Sử dụng ${client.prefix} help <command> để biết thêm thông tin về lệnh`,
            })
            .addFields(...fields);

        return await message.channel.send({ embeds: [helpEmbed] });
    },
);
