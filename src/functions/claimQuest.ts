import type { Quest, User } from "@prisma/client";

export default async function claimQuest(client: ExtendedClient, user: User, quest: Quest) {
    const item = client.items[quest.reward_item];
    if (!item) client.logger.error("Không tìm thấy vật phẩm: ", quest.reward_item);

    if (item.id === "candy") {
        await client.prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                candy: { increment: quest.reward_amount },
                quests: {
                    update: {
                        where: { quest_id: quest.quest_id },
                        data: { claimed: true, progress: quest.target },
                    },
                },
            },
        });
    } else {
        client.logger.error("Trường hợp bất định", quest);
    }
}
