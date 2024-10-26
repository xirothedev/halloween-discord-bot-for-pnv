import { CronJob } from "cron";
import claimQuest from "@/functions/claimQuest";

export default function cronJob(client: ExtendedClient) {
    const jobs = new CronJob(
        "* * * * *", // chạy mỗi phút
        async function () {
            const guild = await client.guilds.fetch(process.env.GUILD_ID);

            if (!guild) return client.logger.warn("Can not load guild");

            const quests = await client.prisma.quest.findMany({
                where: { claimed: false, function: "voice" },
                include: { user: true },
            });

            quests.forEach(async (quest) => {
                const member = await guild.members.fetch(quest.user_id);
                if (!member || !member.voice.channelId) return; // Kiểm tra xem user có trong voice không

                // Kiểm tra nếu user đã có interval chạy thì bỏ qua
                if (client.collection.userVoiceCount.has(member.id)) {
                    return client.logger.info(`User ${member.id} đã có interval`);
                }

                const updateVoiceState = async () => {
                    const data = await client.prisma.quest.update({
                        where: { quest_id: quest.quest_id },
                        data: { progress: { increment: 1 } },
                    });

                    if (data.progress >= data.target && !data.claimed) {
                        await claimQuest(client, quest.user, data);
                    }
                };

                const intervalID = setInterval(async () => {
                    // Kiểm tra lại trạng thái voice trước khi tăng progress
                    const refreshedMember = await guild.members.fetch(member.id);
                    if (!refreshedMember.voice.channelId) {
                        clearInterval(intervalID); // Xóa interval nếu user đã rời voice
                        client.collection.userVoiceCount.delete(member.id); // Xóa user khỏi collection
                        return client.logger.info(`User ${member.id} đã rời voice channel, xóa interval`);
                    }
                    await updateVoiceState();
                }, 60000);

                client.collection.userVoiceCount.set(member.id, intervalID); // Lưu interval vào bộ nhớ
            });

            client.logger.info("Loaded all users to memcache");
        },
        null,
        true,
    );
}
