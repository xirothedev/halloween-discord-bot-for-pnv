import claimQuest from "@/functions/claimQuest";
import event from "@/layouts/event";

export default event("voiceStateUpdate", { once: false }, async (client, oldState, newState) => {
    if (newState.member?.user.bot) return;
    const user = await client.prisma.user.findUnique({
        where: { user_id: newState.member?.id },
        include: { quests: { where: { function: "voice", claimed: false } } },
    });

    if (!user) return;

    const quest = user.quests.find((f) => f.function === "voice");

    if (!quest) return;

    if (!oldState.channelId && newState.channelId) {
        const updateVoiceState = async () => {
            const data = await client.prisma.quest.update({
                where: { quest_id: quest.quest_id },
                data: { progress: { increment: 1 } },
            });

            if (data.progress >= data.target) {
                await claimQuest(client, user, data);
            }
        };

        const intervalID = setInterval(updateVoiceState, 60000);

        client.collection.userVoiceCount.set(user.user_id, intervalID);
    }

    if (oldState.channelId && !newState.channelId) {
        const interval = client.collection.userVoiceCount.get(user.user_id);

        if (!interval) return;

        clearInterval(interval);
    }
});
