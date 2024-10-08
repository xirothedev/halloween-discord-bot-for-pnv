import Logger from "@/helpers/logger";

export default function checkEnv(logger: Logger) {
    const envs = process.env;
    let isValid = true;

    const required = [
        "DATABASE_URL",
        "GUILD_ID",
        "DISCORD_BOT_TOKEN",
        "DISCORD_BOT_CLIENT_ID",
        "PAYMENT_CLIENT_ID",
        "PAYMENT_API_KEY",
        "PAYMENT_CHECKSUM_KEY",
        "BDSD_CHANNEL_ID",
        "BANKNAME",
        "BANKNO",
        "PORT",
        "PREFIX",
    ];

    required.forEach((key) => {
        if (!envs[key]) {
            isValid = false;
            logger.error(`Missing env: ${key}`);
        }
    });

    return isValid;
}
