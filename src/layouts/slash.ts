import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import type { SlashOptions } from "typings/slash";

const slash = (
    structure: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder,
    options: SlashOptions,
    handler: (client: ExtendedClient, interaction: ChatInputCommandInteraction<"cached">) => void,
) => ({
    structure,
    options,
    handler,
});

export default slash;
