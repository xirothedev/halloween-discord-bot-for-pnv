import type { Quest, User } from "@prisma/client";
import { codeBlock } from "discord.js";

export default async function claimQuest(client: ExtendedClient, user: User, quest: Quest) {
    const item = client.items[quest.reward_item];

    // Kiểm tra vật phẩm có tồn tại hay không
    if (!item) {
        return client.logger.error("Không tìm thấy vật phẩm: ", quest.reward_item);
    }

    // Xử lý khi phần thưởng là "candy"
    if (item.id === "candy") {
        // Cập nhật user và trạng thái nhiệm vụ chỉ trong một truy vấn
        const data = await client.prisma.user.update({
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
            include: { quests: true },
        });

        const msg = data.quests.find((f) => f.quest_id === quest.quest_id);

        console.log("Hoàn thành", msg);
        if (client.logQuestChannel?.isSendable()) {
            client.logQuestChannel.send("Hoàn thành: " + codeBlock("json", JSON.stringify(msg)));
        }
    } else {
        // Log lỗi khi trường hợp không xác định xảy ra
        client.logger.error("Trường hợp bất định: ", quest);
    }
}
