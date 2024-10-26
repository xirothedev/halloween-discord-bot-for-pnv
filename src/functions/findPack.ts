export default function findPack(client: ExtendedClient, args: string[]) {
    return client.packs.find(
        (f) =>
            f.id === args[0] ||
            f.name.toLowerCase() === args.join(" ").toLowerCase() ||
            f.name
                .split(" ")
                .map((m) => m.slice(0, 1))
                .join("")
                .toLowerCase() === args[0].toLowerCase(),
    );
}
