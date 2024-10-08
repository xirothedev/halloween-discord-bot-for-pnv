import type { AllEvents, EventOptions } from "typings/event";

const event = <T extends keyof AllEvents>(
    name: T,
    options: EventOptions,
    handler: (client: ExtendedClient, ...args: AllEvents[T]) => void,
) => ({
    name,
    options,
    handler,
});

export default event;
