import { CronJob } from "cron";
import claimQuest from "@/functions/claimQuest";

export default function cronJob(client: ExtendedClient) {
    const jobs = new CronJob(
        "* * * * *",
        async function () {
            const guild = await client.guilds.fetch(process.env.GUILD_ID);

            if (!guild) return client.logger.warn("Can not load guild");

            const quests = await client.prisma.quest.findMany({
                where: { claimed: false, function: "voice" },
                include: { user: true },
            });

            quests.forEach(async (quest) => {
                const member = await guild.members.fetch(quest.user_id);
                console.log(member.voice.channelId);
                if (!member || !member.voice) return;

                const updateVoiceState = async () => {
                    const data = await client.prisma.quest.update({
                        where: { quest_id: quest.quest_id },
                        data: { progress: { increment: 1 } },
                    });

                    if (data.progress >= data.target) {
                        await claimQuest(client, quest.user, data);
                    }
                };

                const intervalID = setInterval(updateVoiceState, 60000);

                client.collection.userVoiceCount.set(member.id, intervalID);
            });

            client.logger.info("Loaded all user to memcache");
        },
        null,
        true,
        "Indochina",
    );
}
