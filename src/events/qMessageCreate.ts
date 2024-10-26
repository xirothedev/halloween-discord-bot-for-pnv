import claimQuest from "@/functions/claimQuest";
import event from "@/layouts/event";

export default event("messageCreate", { once: false }, async (client, message) => {
    if (message.author.bot || !message.inGuild()) return;

    const user = await client.prisma.user.findUnique({
        where: { user_id: message.author.id },
        include: { quests: true },
    });

    if (!user) return;

    const channelQuest = user.quests.find((f) => f.function === "chat_channel" && !f.claimed);
    const noChannelQuest = user.quests.find((f) => f.function === "chat" && !f.claimed);

    // Xử lý nhiệm vụ chat ở kênh cụ thể
    if (channelQuest && channelQuest.channel_id === message.channelId) {
        console.log("Chat kênh", channelQuest.quest_id);
        if (client.logQuestChannel?.isSendable()) {
            client.logQuestChannel.send("Chat kênh: " + channelQuest.quest_id);
        }
        const quest = await client.prisma.quest.update({
            where: { quest_id: channelQuest.quest_id },
            data: { progress: { increment: 1 } },
        });

        if (quest.progress >= quest.target && !quest.claimed) {
            await claimQuest(client, user, quest);
        }
    }

    // Xử lý nhiệm vụ chat ở bất kỳ kênh nào
    if (noChannelQuest) {
        console.log("Chat", noChannelQuest.quest_id);
        if (client.logQuestChannel?.isSendable()) {
            client.logQuestChannel.send("Chat: " + noChannelQuest.quest_id);
        }
        const quest = await client.prisma.quest.update({
            where: { quest_id: noChannelQuest.quest_id },
            data: { progress: { increment: 1 } },
        });

        if (quest.progress >= quest.target && !quest.claimed) {
            await claimQuest(client, user, quest);
        }
    }
});
