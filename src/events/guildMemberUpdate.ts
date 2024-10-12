import claimQuest from "@/functions/claimQuest";
import event from "@/layouts/event";

export default event("guildMemberUpdate", { once: false }, async (client, oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        if (newMember.user.bot) return;
        const user = await client.prisma.user.findUnique({
            where: { user_id: newMember.id },
            include: {
                quests: { where: { function: "boost", claimed: false } },
            },
        });

        if (!user) return;

        const quest = user.quests.find((f) => f.function === "voice");

        const data = await client.prisma.quest.update({
            where: { quest_id: quest?.quest_id },
            data: { progress: { increment: 1 } },
        });

        if (data.progress >= data.target) {
            await claimQuest(client, user, data);
        }
    }
});
