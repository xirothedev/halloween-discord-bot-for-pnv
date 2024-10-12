import initUserVoice from "@/handlers/initUserVoice";
import event from "@/layouts/event";

export default event("ready", { once: true }, async (_, client) => {
    _.logger.success(`Logined to ${client.user.username}`);
    await initUserVoice(_);
});
