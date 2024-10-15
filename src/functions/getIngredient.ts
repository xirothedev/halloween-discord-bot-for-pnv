export default function getIngredient(level: number) {
    const nextLevel = level + 1;
    return {
        candy: nextLevel * 4,
        soul: nextLevel * 3,
    };
}
