import _ from "lodash";
import event from "@/layouts/event";
import claimQuest from "@/functions/claimQuest";

export default event("messageCreate", { once: false }, async (client, message) => {
    if (message.author.bot || !message.inGuild()) return;
    const user = await client.prisma.user.findUnique({
        where: { user_id: message.author.id },
        include: { quests: { where: { OR: [{ function: "chat" }, { function: "chat_channel" }], claimed: false } } },
    });
    if (!user) return;

    const channel = user.quests.find((f) => f.function === "chat_channel");
    const noChannel = user.quests.find((f) => f.function === "chat");

    if (channel && channel.channel_id === message.channelId) {
        const count = client.collection.userMessageCount.get(channel.quest_id);

        client.collection.userMessageCount.set(channel.quest_id, count ? count + 1 : 1);

        const quest = await client.prisma.quest.update({
            where: { quest_id: channel.quest_id },
            data: { progress: { increment: 1 } },
        });

        client.collection.userMessageCount.delete(channel.quest_id);

        if (quest.progress >= quest.target) {
            await claimQuest(client, user, quest);
        }
    }

    if (!channel && noChannel) {
        const count = client.collection.userMessageCount.get(noChannel.quest_id);

        client.collection.userMessageCount.set(noChannel.quest_id, count ? count + 1 : 1);

        const quest = await client.prisma.quest.update({
            where: { quest_id: noChannel.quest_id },
            data: { progress: { increment: 1 } },
        });

        client.collection.userMessageCount.delete(noChannel.quest_id);

        if (quest.progress >= quest.target) {
            await claimQuest(client, user, quest);
        }
    }
});
