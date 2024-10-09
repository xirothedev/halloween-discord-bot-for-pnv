import { getHours, getMinutes, getSeconds } from "date-fns";

export default function minutesUntilMidnight() {
    const midnight = new Date();
    midnight.setHours(24);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    const range = midnight.getTime() - new Date().setHours(24);
    return `${getHours(range)}H ${getMinutes(range)}M ${getSeconds(range)}S`;
}
