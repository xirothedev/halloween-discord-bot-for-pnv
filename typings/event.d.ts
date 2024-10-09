import type { ClientEvents } from "discord.js";

export interface EventOptions {
    once: boolean;
    ignore?: boolean;
}

export interface AllEvents extends ClientEvents {
    bdsd: [body: PayOSGetPaymentData]
}

export interface Event<T extends keyof AllEvents> {
    name: T;
    options: EventOptions;
    handler: (client: ExtendedClient, ...args: AllEvents[T]) => void;
}
