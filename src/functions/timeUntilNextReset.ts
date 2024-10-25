import { getHours, getMinutes, getSeconds } from "date-fns";

export default function timeUntilNextReset() {
    const now = new Date();
    const midnight = new Date();
    const midday = new Date();
    midnight.setHours(24, 0, 0, 0);
    midday.setHours(12, 0, 0, 0);

    if (now.getHours() > 12) {
        const range = midnight.getTime() - new Date().setHours(24);
        return `${getHours(range)}H ${getMinutes(range)}M ${getSeconds(range)}S`;
    } else {
        const range = midday.getTime() - new Date().setHours(12);
        return `${getHours(range)}H ${getMinutes(range)}M ${getSeconds(range)}S`;
    }
}
