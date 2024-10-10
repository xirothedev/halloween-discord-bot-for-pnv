import type { Embed, Message, PermissionResolvable } from "discord.js";
import type { Category } from "./utils";
import type { Card, Pack, Quest, User } from "@prisma/client";

interface PrefixOptions {
    description: {
        content: string;
        usage: string;
        examples: string[];
    };
    aliases?: string[];
    category: Category;
    voiceOnly?: boolean;
    developersOnly?: boolean;
    ownerOnly?: boolean;
    ignore?: boolean;
    nsfw?: boolean;
    hidden?: boolean;
    cooldown?: string;
    userPermissions?: PermissionResolvable[] | null;
    botPermissions?: PermissionResolvable[] | null;
}

interface FullUser extends User {
    quests: Quest[];
    cards: Card[];
    packs: Pack[];
}

interface UserWithCards extends User {
    cards: Card[];
}

export interface Command {
    name: string;
    options: PrefixOptions;
    handler: (client: ExtendedClient, user: FullUser, message: Message<true>, args: string[]) => void;
}
