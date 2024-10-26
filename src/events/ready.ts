import event from "@/layouts/event";
import { time } from "discord.js";

export default event("ready", { once: true }, async (_, client) => {
    _.logger.success(`Logined to ${client.user.username}`);
    _.notiChannel = await _.channels.fetch("1299368232850821192");
    _.logQuestChannel = await _.channels.fetch("1299566828187815986");

    if (_.logQuestChannel?.isSendable()) {
        _.logQuestChannel.send("Bot vừa được khởi động lúc: " + time(new Date(), "R"));
    }
});
