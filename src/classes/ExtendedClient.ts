import config from "@/config";
import cards from "@/data/cards.json";
import items from "@/data/items.json";
import packs from "@/data/packs.json";
import commands from "@/handlers/commands";
import deploy from "@/handlers/deploy";
import events from "@/handlers/events";
import Logger from "@/helpers/logger";
import { PrismaClient } from "@prisma/client";
import { ActivityType, Client, Collection, Partials, PresenceUpdateStatus, type Channel } from "discord.js";
import type { Items, Pack } from "typings";
import type { Command } from "typings/command";
import Utils from "./Utils";
import antiCrash from "@/plugins/antiCrash";
import cronJob from "@/handlers/cronJob";

export const logger = new Logger();
export const prisma = new PrismaClient();

if (config.preconnect) {
    (async () =>
        await prisma.$connect().then(() => {
            logger.info("Connected to database");
        }))();
}

export default class ExtendedClient extends Client<true> {
    public collection = {
        prefixcommands: new Collection<string, Command>(),
        aliases: new Collection<string, string>(),
        interactionCommands: new Collection<string, any>(),
        components: {
            buttons: new Collection<string, any>(),
            selects: new Collection<string, any>(),
            modals: new Collection<string, any>(),
            autocomplete: new Collection<string, any>(),
        },
        userVoiceCount: new Collection<string, Timer>(),
    };

    public applicationcommandsArray: Array<any> = [];

    public prefix?: string;

    constructor() {
        super({
            intents: 3276799,
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User,
                Partials.ThreadMember,
            ],
            allowedMentions: { parse: ["roles", "users"], repliedUser: false },
        });
    }

    public utils = new Utils(this);

    public prisma = prisma;

    public logger = logger;

    public emoji = config.emoji;

    public icons = config.icons;

    public color = config.color;

    public colors = config.colors;

    public items: Items = items;

    public cards = cards;

    public packs = packs as Pack[];

    public notiChannel: Channel | null = null;

    public logQuestChannel: Channel | null = null;

    public start = async (token: string, prefix: string) => {
        commands(this);
        events(this);
        antiCrash(this);
        deploy(this);
        cronJob(this);

        await this.login(token);
        await this.application?.fetch();
        this.prefix = prefix;
        this.user?.setActivity(`Halloween event bot in Phố Người Việt`, {
            type: ActivityType.Streaming,
            url: "https://github.com/sunaookamishirokodev",
        });
        this.user?.setStatus(PresenceUpdateStatus.Online);
    };
}

type CustomClient = ExtendedClient;
declare global {
    interface ExtendedClient extends CustomClient {}
}
