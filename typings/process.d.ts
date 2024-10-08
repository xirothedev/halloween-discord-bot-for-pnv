declare namespace NodeJS {
    interface ProcessEnv {
        readonly DATABASE_URL: string;
        readonly GUILD_ID: string;
        readonly BDSD_CHANNEL_ID: string;
        readonly DISCORD_BOT_TOKEN: string;
        readonly DISCORD_BOT_CLIENT_ID: string;
        readonly PAYMENT_CLIENT_ID: string;
        readonly PAYMENT_API_KEY: string;
        readonly PAYMENT_CHECKSUM_KEY: string;
        readonly BANKNAME: string;
        readonly BANKNO: string;
        readonly PORT: string;
        readonly PREFIX: string
        readonly MODE?: string;
    }
}
