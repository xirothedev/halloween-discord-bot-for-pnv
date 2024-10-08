import isEmptyObject from "@/helpers/isEmptyObject";
import { readdirSync } from "fs";
import type { Command } from "typings/command";
import type { Slash } from "typings/slash";

const commands = async (client: ExtendedClient) => {
    for (const type of readdirSync(`./src/commands/`)) {
        for (const category of readdirSync(`./src/commands/${type}`)) {
            for (const file of readdirSync(`./src/commands/${type}/${category}`).filter(
                (f) => f.endsWith(".js") || f.endsWith(".ts"),
            )) {
                const module: Command | Slash = (await import(`../commands/${type}/${category}/${file}`)).default;

                if (!module || isEmptyObject(module)) {
                    client.logger.warn(`Module not found at: ${file}`);
                    continue;
                }

                if (module.options && module.options?.ignore) {
                    client.logger.warn(`Ignore component at: ${file}`);
                    continue;
                }

                switch (type) {
                    case "prefix":
                        const _module = module as Command;
                        client.collection.prefixcommands.set(_module.name, _module);

                        if (!_module.options?.aliases) break;
                        _module.options.aliases.forEach((alias: string) => {
                            if (client.collection.aliases.has(alias)) {
                                client.logger.error(`Duplicate alias ${alias} at command ${_module.name}!`);
                                return;
                            }
                            client.collection.aliases.set(alias, _module.name);
                        });
                        break;

                    case "slash":
                        const module_ = module as Slash;
                        client.collection.interactionCommands.set(module_.structure.name, module_);
                        client.applicationcommandsArray.push(module_.structure.toJSON());

                        break;

                    default:
                        client.logger.error(`Invalid folder name, it must be prefix/slash!`);
                        return;
                }

                client.logger.info(`Loaded new command at: ${file}`);
            }
        }
    }
};

export default commands;
