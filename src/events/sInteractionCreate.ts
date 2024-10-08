import config from "@/config";
import event from "@/layouts/event";
import type { GuildMember, NewsChannel, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { EmbedBuilder, time } from "discord.js";
import ms from "ms";
import type { Slash } from "typings/slash";

type CooldownProps = { name: string; availableAt: string };
const cooldown = new Map<string, CooldownProps[]>();

export default event("interactionCreate", { once: false }, async (client, interaction) => {
    if (!interaction.isCommand()) return;

    const command: Slash | undefined = client.collection.interactionCommands.get(interaction.commandName);

    if (!command) return;
    const embed = new EmbedBuilder();

    try {
        if (command.options?.ownerOnly && interaction.user.id !== config.users.ownerId) {
            return await interaction.reply({
                embeds: [
                    embed
                        .setColor(client.color.red)
                        .setDescription(`❌ **|** Chỉ có chủ sở hữu bot mới có thể sử dụng lệnh này!`),
                ],
                ephemeral: true,
            });
        }

        if (command.options?.developersOnly && !config.users.devIds.includes(interaction.user.id)) {
            return await interaction.reply({
                embeds: [
                    embed
                        .setColor(client.color.red)
                        .setDescription(`❌ **|** Chỉ có nhà phát triển mới có thể sử dụng lệnh này!`),
                ],
                ephemeral: true,
            });
        }

        if (
            command.options?.cooldown &&
            config.users.ownerId !== interaction.user.id &&
            !config.users.devIds.includes(interaction.user.id)
        ) {
            const setCooldown = (name: string, time: string): CooldownProps => {
                return {
                    name,
                    availableAt: (Date.now() + ms(time)).toString(),
                };
            };

            let data: any = cooldown.get(interaction.user.id);
            if (data) {
                data = data.filter(({ name }: CooldownProps) => name === interaction.commandName);
                data = data[0];
                if (data?.availableAt >= Date.now()) {
                    await interaction
                        .reply({
                            embeds: [
                                embed
                                    .setColor(client.color.red)
                                    .setDescription(
                                        `❌ **|** Bạn đang sử dụng quá nhanh lệnh này! Thử lại lúc  ${time(
                                            Math.floor(data.availableAt / 1000),
                                            "R",
                                        )}!`,
                                    ),
                            ],
                            ephemeral: true,
                        })
                        .then((m) => setTimeout(() => m.delete(), data.availableAt - Date.now()));

                    return;
                }
            } else {
                cooldown.set(interaction.user.id, [
                    setCooldown(interaction.commandName, command.options.cooldown as string),
                ]);
            }

            const cooldownTime = ms(command.options.cooldown as string);

            setTimeout(() => {
                let data = cooldown.get(interaction.user.id);

                if (!data) return;
                data = data.filter(({ name }: CooldownProps) => name !== interaction.commandName);

                if (data.length === 0) {
                    cooldown.delete(interaction.user.id);
                } else {
                    cooldown.set(interaction.user.id, data);
                }
            }, cooldownTime);
        }

        await command.handler(client, interaction as any);
    } catch (error) {
        console.error(error);
        return await interaction.reply({
            embeds: [embed.setColor(client.color.red).setDescription(`❌ **|** Đã xảy ra lỗi!`)],
            ephemeral: true,
        });
    }
});
