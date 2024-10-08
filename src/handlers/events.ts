import isEmptyObject from "@/helpers/isEmptyObject";
import { readdirSync } from "fs";

export default async (client: ExtendedClient) => {
    for (const file of readdirSync("./src/events/").filter((f: string) => f.endsWith(".js") || f.endsWith(".ts"))) {
        const module = (await import(`../events/${file}`)).default;

        if (!module || isEmptyObject(module)) {
            client.logger.warn(`Module not found at: ${file}`);
            continue;
        }

        if (!module.options && module.options.ignore) {
            client.logger.warn(`Ignore event at: ${file}`);
            continue;
        }

        const bindEvent = module.handler.bind(null, client);

        client[module.options.once ? "once" : "on"](module.name, bindEvent);

        client.logger.info("Loaded new event: " + file);
    }
};
