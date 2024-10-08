import ExtendedClient, { logger } from "./classes/ExtendedClient";
import checkEnv from "./plugins/checkEnv";

console.clear();

(async () => {
    const isValidEnv = checkEnv(logger);
    if (!isValidEnv) {
        process.exit(1);
    } else {
        logger.success("Loaded all envs");
    }

    const client = new ExtendedClient();
    await client.start(process.env.DISCORD_BOT_TOKEN, process.env.PREFIX);
})();
