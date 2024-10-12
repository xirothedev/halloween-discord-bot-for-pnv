import claimQuest from "@/functions/claimQuest";

export default async function initUserVoice(client: ExtendedClient) {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) return client.logger.warn("Can not load guild");

    const members = await guild.members.fetch();

    members.forEach(async (member) => {
        const voiceChannelId = member.voice.channelId;
        if (voiceChannelId) {
            const user = await client.prisma.user.findUnique({
                where: { user_id: member.id },
                include: { quests: { where: { function: "voice", claimed: false } } },
            });

            if (!user) return;

            const quest = user.quests.find(f => f.function === "voice")

            const updateVoiceState = async () => {
                const data = await client.prisma.quest.update({
                    where: { quest_id: quest?.quest_id },
                    data: { progress: { increment: 0.1 } },
                });

                if (data.progress >= data.target) {
                    await claimQuest(client, user, data);
                }
            };

            const intervalID = setInterval(updateVoiceState, 6000);

            client.collection.userVoiceCount.set(member.id, intervalID);
        }
    });

    client.logger.info("Loaded all user to memcache");
}
