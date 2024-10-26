import { getHours, getMinutes, getSeconds } from "date-fns";

export default function timeUntilNextReset() {
    const now = new Date();

    const midnight = new Date(now);
    const midday = new Date(now);

    // Đặt thời gian mục tiêu
    midnight.setHours(24, 0, 0, 0);
    midday.setHours(12, 0, 0, 0);

    let range: number;

    if (now.getHours() >= 12) {
        // Nếu sau 12h trưa, tính thời gian đến 12h đêm
        range = midnight.getTime() - now.getTime();
    } else {
        // Nếu trước 12h trưa, tính thời gian đến 12h trưa
        range = midday.getTime() - now.getTime();
    }

    // Chuyển đổi từ millisecond sang giờ, phút, giây
    const hours = Math.floor(range / (1000 * 60 * 60));
    const minutes = Math.floor((range % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((range % (1000 * 60)) / 1000);

    // Trả về chuỗi thông báo thời gian còn lại
    return `${hours}H ${minutes}M ${seconds}S`;
}
