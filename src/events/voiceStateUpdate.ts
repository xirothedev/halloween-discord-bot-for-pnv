import claimQuest from "@/functions/claimQuest";
import event from "@/layouts/event";

export default event("voiceStateUpdate", { once: false }, async (client, oldState, newState) => {
    // Bỏ qua nếu là bot
    if (newState.member?.user.bot) return;

    // Tìm người dùng và nhiệm vụ voice chưa hoàn thành
    const user = await client.prisma.user.findUnique({
        where: { user_id: newState.member?.id },
        include: { quests: { where: { function: "voice", claimed: false } } },
    });

    if (!user) return;

    const quest = user.quests.find((f) => f.function === "voice" && !f.claimed);

    if (!quest) return;

    // Người dùng vào kênh voice
    if (!oldState.channelId && newState.channelId) {
        if (client.collection.userVoiceCount.has(user.user_id)) {
            return client.logger.info(`User ${user.user_id} đã có interval`);
        }

        // Tạo hàm cập nhật tiến trình nhiệm vụ voice
        const updateVoiceState = async () => {
            const data = await client.prisma.quest.update({
                where: { quest_id: quest.quest_id, claimed: false },
                data: { progress: { increment: 1 } },
            });

            console.log("Cộng", data);

            if (data.progress >= data.target && !data.claimed) {
                await claimQuest(client, user, data);
                const interval = client.collection.userVoiceCount.get(user.user_id);
                if (interval) {
                    clearInterval(interval);
                }
            }
        };

        const intervalID = setInterval(async () => {
            const refreshedMember = await newState.guild.members.fetch(user.user_id);
            if (!refreshedMember.voice.channelId) {
                clearInterval(intervalID);
                client.collection.userVoiceCount.delete(user.user_id);
                return client.logger.info(`User ${user.user_id} đã rời voice channel, xóa interval`);
            }
            await updateVoiceState();
        }, 60000);

        client.collection.userVoiceCount.set(user.user_id, intervalID);
        client.logger.info(`Tạo interval cho user ${user.user_id}`);
    }

    if (oldState.channelId && !newState.channelId) {
        const interval = client.collection.userVoiceCount.get(user.user_id);

        if (!interval) return;

        clearInterval(interval);
        client.collection.userVoiceCount.delete(user.user_id);
        client.logger.info(`User ${user.user_id} rời khỏi voice channel, xóa interval`);
    }
});
