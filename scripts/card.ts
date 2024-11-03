import { resolvePower } from "@/functions/power";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        orderBy: { highest_streak_winner: "desc" },
        select: { user_id: true },
        take: 10,
    });

    console.table(users);
}

main();
