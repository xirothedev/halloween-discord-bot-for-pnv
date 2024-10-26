import Logger from "@/helpers/logger";

export default function checkEnv(logger: Logger) {
    const envs = process.env;
    let isValid = true;

    const required = ["DATABASE_URL", "GUILD_ID", "DISCORD_BOT_TOKEN", "DISCORD_BOT_CLIENT_ID", "PREFIX"];

    required.forEach((key) => {
        if (!envs[key]) {
            isValid = false;
            logger.error(`Missing env: ${key}`);
        }
    });

    return isValid;
}
