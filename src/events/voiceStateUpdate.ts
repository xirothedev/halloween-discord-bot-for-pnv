import event from "@/layouts/event";

export default event("voiceStateUpdate", { once: false }, async (client, oldState, newState) => {
    if (newState.member?.user.bot) return;
    const user = await client.prisma.user.findUnique({
        where: { user_id: newState.member?.id },
        include: { quests: { where: { function: "voice", claimed: false } } },
    });

    if (!user) return;

    if (!oldState.channelId && newState.channelId) {
        const updateVoiceState = async () => {
            await client.prisma.quest.update({
                where: { quest_id: user.quests[0].quest_id },
                data: { progress: { increment: 0.1 } },
            });
        };

        const intervalID = setInterval(updateVoiceState, 6000);

        client.collection.userVoiceCount.set(user.user_id, intervalID);
    }

    if (oldState.channelId && !newState.channelId) {
        const interval = client.collection.userVoiceCount.get(user.user_id);

        if (!interval) return;

        clearInterval(interval);
    }
});
