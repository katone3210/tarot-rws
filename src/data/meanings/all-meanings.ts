
import type { TarotCardMeaning } from "@/data/tarot-cards";
import { majorArcanaMeanings } from "@/data/meanings/major-arcana";
import { wandsMeanings } from "@/data/meanings/wands";
import { cupsMeanings } from "@/data/meanings/cups";
import { swordsMeanings } from "@/data/meanings/swords";
import { pentaclesMeanings } from "@/data/meanings/pentacles";

export const allTarotMeanings: TarotCardMeaning[] = [
  ...majorArcanaMeanings,
  ...wandsMeanings,
  ...cupsMeanings,
  ...swordsMeanings,
  ...pentaclesMeanings,
];

export function getTarotMeaningById(
  cardId: string,
): TarotCardMeaning | undefined {
  return allTarotMeanings.find(
    (meaning) => meaning.cardId === cardId,
  );
}
