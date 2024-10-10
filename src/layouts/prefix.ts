import type { Message } from "discord.js";
import type { FullUser, PrefixOptions } from "typings/command";
const prefix = (
    name: string,
    options: PrefixOptions,
    handler: (client: ExtendedClient, user: FullUser, message: Message<true>, args: string[]) => void
) => ({
    name,
    options,
    handler,
});

export default prefix;
