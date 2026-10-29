
export type TarotCard = {
  id: string;
  number: number;
  nameEn: string;
  nameTh: string;
  arcana: "major" | "minor";
  suit: "major" | "wands" | "cups" | "swords" | "pentacles";
};

export type TarotCardMeaning = {
  cardId: string;

  keywords: string[];

  upright: {
    general: string;
    love: string;
    career: string;
    finance: string;
  };

  reversed: {
    general: string;
    love: string;
    career: string;
    finance: string;
  };
};

const majorCards: Omit<TarotCard, "arcana" | "suit">[] = [
  { id: "major-00", number: 0, nameEn: "The Fool", nameTh: "คนพเนจร" },
  { id: "major-01", number: 1, nameEn: "The Magician", nameTh: "นักมายากล" },
  { id: "major-02", number: 2, nameEn: "The High Priestess", nameTh: "มหาปุโรหิตหญิง" },
  { id: "major-03", number: 3, nameEn: "The Empress", nameTh: "จักรพรรดินี" },
  { id: "major-04", number: 4, nameEn: "The Emperor", nameTh: "จักรพรรดิ" },
  { id: "major-05", number: 5, nameEn: "The Hierophant", nameTh: "มหาปุโรหิต" },
  { id: "major-06", number: 6, nameEn: "The Lovers", nameTh: "คู่รัก" },
  { id: "major-07", number: 7, nameEn: "The Chariot", nameTh: "รถศึก" },
  { id: "major-08", number: 8, nameEn: "Strength", nameTh: "พลังใจ" },
  { id: "major-09", number: 9, nameEn: "The Hermit", nameTh: "ฤๅษี" },
  { id: "major-10", number: 10, nameEn: "Wheel of Fortune", nameTh: "วงล้อแห่งโชคชะตา" },
  { id: "major-11", number: 11, nameEn: "Justice", nameTh: "ความยุติธรรม" },
  { id: "major-12", number: 12, nameEn: "The Hanged Man", nameTh: "ชายแขวนหัว" },
  { id: "major-13", number: 13, nameEn: "Death", nameTh: "ความเปลี่ยนแปลง" },
  { id: "major-14", number: 14, nameEn: "Temperance", nameTh: "ความพอดี" },
  { id: "major-15", number: 15, nameEn: "The Devil", nameTh: "ปีศาจ" },
  { id: "major-16", number: 16, nameEn: "The Tower", nameTh: "หอคอย" },
  { id: "major-17", number: 17, nameEn: "The Star", nameTh: "ดวงดาว" },
  { id: "major-18", number: 18, nameEn: "The Moon", nameTh: "ดวงจันทร์" },
  { id: "major-19", number: 19, nameEn: "The Sun", nameTh: "ดวงอาทิตย์" },
  { id: "major-20", number: 20, nameEn: "Judgement", nameTh: "การตื่นรู้" },
  { id: "major-21", number: 21, nameEn: "The World", nameTh: "โลก" },
];

const ranks = [
  { en: "Ace", th: "หนึ่ง" },
  { en: "Two", th: "สอง" },
  { en: "Three", th: "สาม" },
  { en: "Four", th: "สี่" },
  { en: "Five", th: "ห้า" },
  { en: "Six", th: "หก" },
  { en: "Seven", th: "เจ็ด" },
  { en: "Eight", th: "แปด" },
  { en: "Nine", th: "เก้า" },
  { en: "Ten", th: "สิบ" },
  { en: "Page", th: "มหาดเล็ก" },
  { en: "Knight", th: "อัศวิน" },
  { en: "Queen", th: "ราชินี" },
  { en: "King", th: "ราชา" },
];

const suits = [
  { id: "wands", en: "Wands", th: "ไม้เท้า" },
  { id: "cups", en: "Cups", th: "ถ้วย" },
  { id: "swords", en: "Swords", th: "ดาบ" },
  { id: "pentacles", en: "Pentacles", th: "เหรียญ" },
] as const;

const major: TarotCard[] = majorCards.map((card) => ({
  ...card,
  arcana: "major",
  suit: "major",
}));

const minor: TarotCard[] = suits.flatMap((suit) =>
  ranks.map((rank, rankIndex) => ({
    id: `${suit.id}-${String(rankIndex + 1).padStart(2, "0")}`,
    number: rankIndex + 1,
    nameEn: `${rank.en} of ${suit.en}`,
    nameTh: `${suit.th}${rankIndex < 10 ? ` ${rank.th}` : ` ${rank.th}`}`,
    arcana: "minor" as const,
    suit: suit.id,
  })),
);

export const tarotCards: TarotCard[] = [...major, ...minor];

export function getTarotCardById(
  id: string,
): TarotCard | undefined {
  return tarotCards.find((card) => card.id === id);
}
