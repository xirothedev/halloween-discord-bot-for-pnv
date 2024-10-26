import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.user.updateMany({ where: { candy: { lt: 60 } }, data: { candy: { increment: 60 } } });
}

main();
