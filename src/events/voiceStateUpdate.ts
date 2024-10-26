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
        // Kiểm tra xem người dùng đã có interval chưa
        if (client.collection.userVoiceCount.has(user.user_id)) {
            return client.logger.info(`User ${user.user_id} đã có interval`);
        }

        // Tạo hàm cập nhật tiến trình nhiệm vụ voice
        const updateVoiceState = async () => {
            const data = await client.prisma.quest.update({
                where: { quest_id: quest.quest_id },
                data: { progress: { increment: 1 } },
            });

            console.log("Cộng", data);

            // Kiểm tra nếu nhiệm vụ hoàn thành
            if (data.progress >= data.target && !data.claimed) {
                await claimQuest(client, user, data);
            }
        };

        // Tạo interval để cập nhật nhiệm vụ mỗi phút
        const intervalID = setInterval(async () => {
            // Kiểm tra lại nếu người dùng vẫn còn trong voice
            const refreshedMember = await newState.guild.members.fetch(user.user_id);
            if (!refreshedMember.voice.channelId) {
                clearInterval(intervalID); // Xóa interval nếu người dùng rời khỏi voice
                client.collection.userVoiceCount.delete(user.user_id); // Xóa user khỏi collection
                return client.logger.info(`User ${user.user_id} đã rời voice channel, xóa interval`);
            }
            await updateVoiceState();
        }, 60000);

        // Lưu interval vào bộ nhớ
        client.collection.userVoiceCount.set(user.user_id, intervalID);
        client.logger.info(`Tạo interval cho user ${user.user_id}`);
    }

    // Người dùng rời kênh voice
    if (oldState.channelId && !newState.channelId) {
        const interval = client.collection.userVoiceCount.get(user.user_id);

        if (!interval) return; // Nếu không có interval thì thoát

        clearInterval(interval); // Xóa interval
        client.collection.userVoiceCount.delete(user.user_id); // Xóa user khỏi collection
        client.logger.info(`User ${user.user_id} rời khỏi voice channel, xóa interval`);
    }
});
