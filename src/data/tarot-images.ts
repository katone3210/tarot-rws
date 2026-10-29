
import type { TarotCard } from "@/data/tarot-cards";

const majorImageNames: Record<string, string> = {
  "major-00": "00_Fool.jpg",
  "major-01": "01_Magician.jpg",
  "major-02": "02_High_Priestess.jpg",
  "major-03": "03_Empress.jpg",
  "major-04": "04_Emperor.jpg",
  "major-05": "05_Hierophant.jpg",
  "major-06": "06_Lovers.jpg",
  "major-07": "07_Chariot.jpg",
  "major-08": "08_Strength.jpg",
  "major-09": "09_Hermit.jpg",
  "major-10": "10_Wheel_of_Fortune.jpg",
  "major-11": "11_Justice.jpg",
  "major-12": "12_Hanged_Man.jpg",
  "major-13": "13_Death.jpg",
  "major-14": "14_Temperance.jpg",
  "major-15": "15_Devil.jpg",
  "major-16": "16_Tower.jpg",
  "major-17": "17_Star.jpg",
  "major-18": "18_Moon.jpg",
  "major-19": "19_Sun.jpg",
  "major-20": "20_Judgement.jpg",
  "major-21": "21_World.jpg",
};

const suitImagePrefixes: Record<string, string> = {
  wands: "Wands",
  cups: "Cups",
  swords: "Swords",
  pentacles: "Pents",
};

export function getTarotImagePath(card: TarotCard): string {
  if (card.id.startsWith("major-")) {
    const imageName = majorImageNames[card.id];

    if (!imageName) {
      return "/images/00_Fool.jpg";
    }

    return `/images/${imageName}`;
  }

  const [suit, number] = card.id.split("-");
  const prefix = suitImagePrefixes[suit];

  if (!prefix || !number) {
    return "/images/00_Fool.jpg";
  }

  const imageNumber = number.padStart(2, "0");

  return `/images/${prefix}${imageNumber}.jpg`;
}
