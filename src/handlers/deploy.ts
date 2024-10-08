import config from "@/config";
import isSnowflake from "@/helpers/isSnowFlake";
import { Routes, REST } from "discord.js";

const deploy = async (client: ExtendedClient) => {
    try {
        client.logger.info("Started loading application commands... (this might take minutes!)");

        const guildId = process.env.GUILD_ID;
        const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);

        if (guildId && isSnowflake(guildId) && !config.publicCommand) {
            await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_CLIENT_ID, guildId), {
                body: client.applicationcommandsArray,
            });

            client.logger.success(`Successfully loaded application commands to server ${guildId}.`);
        } else {
            await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), {
                body: client.applicationcommandsArray,
            });

            client.logger.success("Successfully loaded application commands globally to Discord API.");
        }
    } catch (error) {
        console.error(error);
        client.logger.error(`Unable to load application commands to Discord API`);
    }
};

export default deploy;
