import { CronJob } from "cron";

export default function cronJob(client: ExtendedClient) {
    const job = new CronJob(
        "0 0 * * *",
        async function () {
            await client.prisma.pack.deleteMany();
        },
        null,
        true,
        "Indochina",
    );
}
