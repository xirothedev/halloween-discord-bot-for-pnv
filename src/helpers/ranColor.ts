import type { ColorResolvable } from "discord.js";
import ranInt from "./ranInt";

export default function ranColor(args: ColorResolvable[]) {
    return args[ranInt(0, args.length)];
}
