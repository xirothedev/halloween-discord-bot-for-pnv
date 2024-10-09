import type { User } from "@prisma/client";
import type { Message } from "discord.js";
import type { PrefixOptions } from "typings/command";
const prefix = (
    name: string,
    options: PrefixOptions,
    handler: (client: ExtendedClient, user: User, message: Message<true>, args: string[]) => void
) => ({
    name,
    options,
    handler,
});

export default prefix;
