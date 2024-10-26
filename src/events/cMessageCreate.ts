import config from "@/config";
import event from "@/layouts/event";
import { EmbedBuilder, NewsChannel, StageChannel, TextChannel, VoiceChannel, time } from "discord.js";
import ms from "ms";
import type { Command } from "typings/command";

type CooldownProps = { name: string; availableAt: number };
export const cooldown = new Map<string, CooldownProps[]>();

export default event("messageCreate", { once: false }, async (client, message) => {
    if (message.author.bot || !message.inGuild() || !client.prefix) return;

    const content = message.content.trim();
    if (!content.toLowerCase().startsWith(client.prefix.toLowerCase())) return;

    const args = content.slice(client.prefix.length).trim().split(/\s+/);
    const commandInput = args.shift()?.toLowerCase();
    if (!commandInput) return;

    const command: Command | undefined =
        client.collection.prefixcommands.get(commandInput) ||
        client.collection.prefixcommands.get(client.collection.aliases.get(commandInput)!);

    if (!command) return;

    const embed = new EmbedBuilder().setColor(client.color.red);

    try {
        if (command.options.ownerOnly && message.author.id !== config.users.ownerId) {
            return await message.channel.send({
                embeds: [embed.setDescription("❌ **|** Chỉ có chủ sở hữu bot mới có thể sử dụng lệnh này!")],
            });
        }

        if (command.options.developersOnly && !config.users.devIds.includes(message.author.id)) {
            return await message.channel.send({
                embeds: [embed.setDescription("❌ **|** Chỉ có nhà phát triển bot mới có thể sử dụng lệnh này!")],
            });
        }

        if (command.options.nsfw && !message.channel.isThread()) {
            const channel = message.channel as NewsChannel | StageChannel | TextChannel | VoiceChannel;
            if (!channel.nsfw) {
                return await message.channel.send({
                    embeds: [embed.setDescription("❌ **|** Lệnh này chỉ có thể được sử dụng trong kênh NSFW!")],
                });
            }
        }

        if (command.options.userPermissions && !message.member?.permissions.has(command.options.userPermissions)) {
            return await message.channel.send({
                embeds: [embed.setDescription("❌ **|** Bạn không có quyền sử dụng lệnh này!")],
            });
        }

        if (
            command.options.botPermissions &&
            !message.guild.members.me?.permissions.has(command.options.botPermissions)
        ) {
            return await message.channel.send({
                embeds: [embed.setDescription("❌ **|** Tôi không có quyền thực hiện điều này!")],
            });
        }

        if (
            command.options.cooldown &&
            config.users.ownerId !== message.author.id &&
            !config.users.devIds.includes(message.author.id)
        ) {
            const now = Date.now();
            const setCooldown = (name: string, duration: string): CooldownProps => ({
                name,
                availableAt: now + ms(duration),
            });

            const userCooldowns = cooldown.get(message.author.id) || [];
            const commandCooldown = userCooldowns.find((cooldown) => cooldown.name === commandInput);

            if (commandCooldown && commandCooldown.availableAt > now) {
                const retryTime = Math.floor(commandCooldown.availableAt / 1000);
                return message.channel
                    .send({
                        embeds: [
                            embed.setDescription(
                                `❌ **|** Bạn đang sử dụng quá nhanh lệnh này! Thử lại lúc ${time(retryTime, "R")}!`,
                            ),
                        ],
                    })
                    .then((msg) => setTimeout(() => msg.delete(), 5000));
            }

            cooldown.set(message.author.id, [
                ...userCooldowns.filter((cooldown) => cooldown.name !== commandInput),
                setCooldown(commandInput, command.options.cooldown),
            ]);

            setTimeout(() => {
                const updatedCooldowns =
                    cooldown.get(message.author.id)?.filter((cooldown) => cooldown.name !== commandInput) || [];
                if (updatedCooldowns.length > 0) {
                    cooldown.set(message.author.id, updatedCooldowns);
                } else {
                    cooldown.delete(message.author.id);
                }
            }, ms(command.options.cooldown));
        }

        const user = await client.prisma.user.upsert({
            where: { user_id: message.author.id },
            create: { user_id: message.author.id, candy: 60 },
            include: { packs: true, cards: true, quests: { orderBy: { quest_id: "asc" } } },
            update: {},
        });

        await command.handler(client, user, message, args);
    } catch (error) {
        console.error(error);
    }
});
