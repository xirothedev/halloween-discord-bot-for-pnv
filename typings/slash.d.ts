import type {
  ChatInputCommandInteraction, PermissionResolvable, SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

interface SlashOptions {
    developersOnly?: boolean;
    ownerOnly?: boolean;
    ignore?: boolean;
    cooldown?: string;
    botPermissions?: PermissionResolvable[] | null;
}

export interface Slash {
    structure: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    options: SlashOptions;
    handler: (client: ExtendedClient, interaction: ChatInputCommandInteraction) => Promise<void> | void;
}
