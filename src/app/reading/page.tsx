"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { tarotCards } from "@/data/tarot-cards";
import { getTarotImagePath } from "@/data/tarot-images";
import { getTarotMeaningById } from "@/data/meanings/all-meanings";

const threeCardPositions = [
  { name: "อดีต", english: "PAST" },
  { name: "ปัจจุบัน", english: "PRESENT" },
  { name: "อนาคต", english: "FUTURE" },
];

const celticPositions = [
  { name: "สถานการณ์ปัจจุบัน", english: "1 · PRESENT SITUATION" },
  { name: "อุปสรรค / สิ่งท้าทาย", english: "2 · CHALLENGE" },
  { name: "รากฐานของเรื่อง", english: "3 · FOUNDATION" },
  { name: "อดีตที่ผ่านมา", english: "4 · RECENT PAST" },
  { name: "เป้าหมาย / สิ่งที่อยู่ในความคิด", english: "5 · CROWNING" },
  { name: "อนาคตอันใกล้", english: "6 · NEAR FUTURE" },
  { name: "ตัวผู้ถาม", english: "7 · YOURSELF" },
  { name: "สภาพแวดล้อม", english: "8 · ENVIRONMENT" },
  { name: "ความหวังและความกลัว", english: "9 · HOPES & FEARS" },
  { name: "ผลลัพธ์ที่เป็นไปได้", english: "10 · OUTCOME" },
];

const singlePosition = {
  name: "คำแนะนำสำหรับคุณ",
  english: "YOUR GUIDANCE",
};

type ReadingTopic = "general" | "love" | "career" | "finance";

type DrawnCard = {
  id: string;
  name: string;
  orientation: "upright" | "reversed";
};

const topics: {
  id: ReadingTopic;
  label: string;
  icon: string;
}[] = [
  { id: "general", label: "ภาพรวมชีวิต", icon: "✧" },
  { id: "love", label: "ความรัก", icon: "♡" },
  { id: "career", label: "การงาน", icon: "⌘" },
  { id: "finance", label: "การเงิน", icon: "฿" },
];

function getTopicLabel(topic: ReadingTopic): string {
  return (
    topics.find((item) => item.id === topic)?.label ??
    "ภาพรวมชีวิต"
  );
}

function getAdvice(topic: ReadingTopic): string {
  switch (topic) {
    case "love":
      return "ให้ความสำคัญกับการสื่อสารอย่างตรงไปตรงมา รับฟังความต้องการของกันและกัน และพิจารณาความสัมพันธ์จากการกระทำอย่างสม่ำเสมอ";

    case "career":
      return "ทบทวนเป้าหมายการทำงาน จัดลำดับความสำคัญ และเลือกลงมือทำสิ่งที่คุณสามารถควบคุมได้ในตอนนี้";

    case "finance":
      return "ตรวจสอบรายรับ รายจ่าย และภาระผูกพันให้ชัดเจนก่อนตัดสินใจเรื่องเงิน โดยคำนึงถึงความเสี่ยงและเงินสำรองด้วย";

    default:
      return "ลองพิจารณาว่าประสบการณ์ที่ผ่านมาเกี่ยวข้องกับการตัดสินใจในปัจจุบันอย่างไร แล้วเลือกก้าวต่อไปที่สอดคล้องกับเป้าหมายของคุณ";
  }
}

// สร้าง Seed จากข้อมูลผู้เล่น เวลา และรอบการสับไพ่
function createPersonalSeed(
  nickname: string,
  day: string,
  month: string,
  year: string,
  attempt: number
): number {
  const now = new Date();

  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const source =
    `${nickname.trim().toUpperCase()}|${day}|${month}|${year}|${time}|${attempt}`;

  let seed = 2166136261;

  for (let i = 0; i < source.length; i++) {
    seed ^= source.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  return seed >>> 0;
}

// สร้างตัวเลขสุ่มจาก Seed
function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return function () {
    value += 0x6D2B79F5;

    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ReadingContent() {
  const searchParams = useSearchParams();

  const requestedMode = searchParams.get("mode");

  const mode =
    requestedMode === "one" || requestedMode === "celtic"
      ? requestedMode
      : "three";

  const cardCount =
    mode === "one" ? 1 : mode === "celtic" ? 10 : 3;

  const activePositions =
    mode === "celtic" ? celticPositions : threeCardPositions;

  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [pendingCards, setPendingCards] = useState<DrawnCard[]>([]);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const [readingTopic, setReadingTopic] =
    useState<ReadingTopic>("general");

  // ข้อมูลส่วนตัวผู้เล่น
  const [nickname, setNickname] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  // เก็บ ID ของไพ่ที่ผู้เล่นเปิดคำอธิบายแล้ว
  const [revealedMeaningIds, setRevealedMeaningIds] =
    useState<Set<string>>(new Set());

  // นับจำนวนรอบการสับไพ่
  const shuffleAttemptRef = useRef(0);

  const readingResultRef = useRef<HTMLDivElement>(null);

  // ตรวจสอบข้อมูลวันเกิด
  const isBirthdayValid = (() => {
    const day = Number(birthDay);
    const month = Number(birthMonth);
    const year = Number(birthYear);

    const currentYearBE = new Date().getFullYear() + 543;

    if (
      !nickname.trim() ||
      !birthDay ||
      !birthMonth ||
      !birthYear ||
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year) ||
      year < 2400 ||
      year > currentYearBE ||
      day < 1 ||
      month < 1 ||
      month > 12
    ) {
      return false;
    }

    const date = new Date(
      Date.UTC(year - 543, month - 1, day)
    );

    return (
      date.getUTCFullYear() === year - 543 &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  })();

  // ตรวจสอบว่าผู้เล่นเปิดคำอธิบายครบทุกใบหรือยัง
  const allMeaningsOpened =
    drawnCards.length === cardCount &&
    drawnCards.every((card) =>
      revealedMeaningIds.has(card.id)
    );

  // เปิดคำอธิบายของไพ่แต่ละใบ
  function revealMeaning(cardId: string) {
    setRevealedMeaningIds((current) => {
      const next = new Set(current);
      next.add(cardId);
      return next;
    });
  }

  // เมื่อเปิดไพ่ใบแรก ให้เลื่อนลงมาที่ผลไพ่โดยอัตโนมัติ
  useEffect(() => {
    if (mode === "three" && drawnCards.length === 1) {
      window.requestAnimationFrame(() => {
        readingResultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [drawnCards.length, mode]);

  // สับไพ่ใหม่และเตรียมไพ่ตามรูปแบบการอ่าน
  function shuffleDeck() {
    if (isShuffling || !isBirthdayValid) return;

    shuffleAttemptRef.current += 1;

    const seed = createPersonalSeed(
      nickname,
      birthDay,
      birthMonth,
      birthYear,
      shuffleAttemptRef.current
    );

    const random = createSeededRandom(seed);

    const shuffled = [...tarotCards];

    // Fisher-Yates Shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    // สุ่มไพ่และตำแหน่งตั้งตรง / กลับหัว
    const result: DrawnCard[] = shuffled
      .slice(0, cardCount)
      .map((card) => ({
        id: card.id,
        name: card.nameTh + " (" + card.nameEn + ")",
        orientation:
          random() < 0.5 ? "upright" : "reversed",
      }));

    setPendingCards(result);
    setDrawnCards([]);
    setRevealedMeaningIds(new Set());
    setHasShuffled(false);
    setIsShuffling(true);

    window.setTimeout(() => {
      setIsShuffling(false);
      setHasShuffled(true);
    }, 2550);
  }

  // เริ่มหยิบไพ่หลังจากสับเสร็จ
  function startDrawing() {
    if (
      !hasShuffled ||
      isShuffling ||
      pendingCards.length !== cardCount
    ) {
      return;
    }

    setRevealedMeaningIds(new Set());

    if (mode === "three") {
      setDrawnCards([pendingCards[0]]);
    } else {
      setDrawnCards(pendingCards);
    }
  }

  // หยิบไพ่ใบถัดไป สำหรับโหมด 3 ใบ
  function revealNextCard() {
    if (mode !== "three" || drawnCards.length >= 3) return;

    const nextCard = pendingCards[drawnCards.length];

    if (!nextCard) return;

    setDrawnCards((current) => [...current, nextCard]);
  }

  // เริ่มอ่านไพ่ใหม่
  function restartReading() {
    setDrawnCards([]);
    setPendingCards([]);
    setRevealedMeaningIds(new Set());
    setHasShuffled(false);
    setIsShuffling(false);
  }

  return (
    <main className="arcana-reading-shell relative min-h-screen overflow-hidden px-4 py-10 text-[#f5e6c8] sm:px-6 sm:py-14">
      <style jsx>{`
        .arcana-reading-shell {
          --gold: #d7b76e;
          --gold-light: #f5dfa4;
          --purple: #a78bfa;
          --purple-light: #c4b5fd;
          --panel: rgba(24, 20, 48, 0.76);
          --panel-border: rgba(215, 183, 110, 0.28);
          background:
            radial-gradient(ellipse at 50% -10%, rgba(106, 72, 160, 0.28), transparent 48%),
            radial-gradient(ellipse at 0% 45%, rgba(82, 55, 130, 0.12), transparent 38%),
            radial-gradient(ellipse at 100% 70%, rgba(112, 76, 154, 0.12), transparent 38%),
            linear-gradient(180deg, #090817 0%, #100d20 48%, #090817 100%);
          isolation: isolate;
        }

        .arcana-reading-shell::before,
        .arcana-reading-shell::after {
          content: "";
          position: absolute;
          pointer-events: none;
          z-index: -1;
          border-radius: 50%;
          filter: blur(2px);
        }

        .arcana-reading-shell::before {
          width: 420px;
          height: 420px;
          top: 10%;
          left: -300px;
          border: 1px solid rgba(215, 183, 110, 0.12);
          box-shadow:
            0 0 80px rgba(167, 139, 250, 0.08),
            inset 0 0 80px rgba(167, 139, 250, 0.05);
        }

        .arcana-reading-shell::after {
          width: 520px;
          height: 520px;
          right: -380px;
          bottom: 8%;
          border: 1px solid rgba(215, 183, 110, 0.1);
          box-shadow: 0 0 100px rgba(167, 139, 250, 0.08);
        }

        .arcana-header {
          position: relative;
          padding: 1.5rem 0 2rem;
        }

        .arcana-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          color: var(--gold);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.48em;
          text-shadow: 0 0 20px rgba(215, 183, 110, 0.45);
        }

        .arcana-title {
          color: #fff4d8;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
          letter-spacing: 0.025em;
          line-height: 1.2;
          text-shadow:
            0 0 24px rgba(196, 181, 253, 0.18),
            0 3px 20px rgba(0, 0, 0, 0.5);
        }

        .arcana-subtitle {
          color: #bcb3d0;
          letter-spacing: 0.08em;
        }

        .arcana-mystic-orbit {
          position: absolute;
          width: 250px;
          height: 250px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(215, 183, 110, 0.08);
          border-radius: 50%;
          pointer-events: none;
          box-shadow:
            0 0 50px rgba(167, 139, 250, 0.07),
            inset 0 0 50px rgba(167, 139, 250, 0.04);
        }

        .arcana-mystic-orbit::before,
        .arcana-mystic-orbit::after {
          content: "✦";
          position: absolute;
          color: rgba(215, 183, 110, 0.55);
          font-size: 1rem;
        }

        .arcana-mystic-orbit::before {
          top: 8%;
          left: 18%;
        }

        .arcana-mystic-orbit::after {
          right: 15%;
          bottom: 12%;
        }

        .arcana-panel {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--panel-border);
          border-radius: 1.4rem;
          background:
            linear-gradient(145deg, rgba(45, 34, 75, 0.48), rgba(17, 14, 34, 0.88)),
            var(--panel);
          box-shadow:
            0 18px 55px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(18px);
        }

        .arcana-panel::before {
          content: "";
          position: absolute;
          top: 0;
          left: 12%;
          right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.65;
        }

        .arcana-input {
          width: 100%;
          border: 1px solid rgba(167, 139, 250, 0.28);
          border-radius: 0.85rem;
          background: rgba(8, 7, 22, 0.72);
          padding: 0.8rem 1rem;
          color: #fff4d8;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        }

        .arcana-input::placeholder {
          color: #77718c;
        }

        .arcana-input:focus {
          border-color: var(--gold);
          background: rgba(15, 12, 31, 0.95);
          box-shadow: 0 0 0 3px rgba(215, 183, 110, 0.1);
        }

        .arcana-topic {
          position: relative;
          overflow: hidden;
          min-height: 108px;
          border: 1px solid rgba(167, 139, 250, 0.22);
          border-radius: 1rem;
          background: rgba(25, 20, 48, 0.72);
          color: #c7bddc;
          transition:
            transform 0.25s ease,
            border-color 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .arcana-topic:hover {
          transform: translateY(-3px);
          border-color: rgba(215, 183, 110, 0.6);
          background: rgba(50, 38, 77, 0.75);
        }

        .arcana-topic-active {
          border-color: var(--gold);
          background: linear-gradient(145deg, rgba(119, 87, 153, 0.38), rgba(42, 31, 67, 0.9));
          color: var(--gold-light);
          box-shadow:
            0 0 24px rgba(215, 183, 110, 0.12),
            inset 0 0 20px rgba(215, 183, 110, 0.06);
        }

        .arcana-topic-active::after {
          content: "";
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .arcana-button-primary,
        .arcana-button-secondary {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          min-height: 48px;
          border-radius: 999px;
          padding: 0.8rem 2rem;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease,
            border-color 0.25s ease;
        }

        .arcana-button-primary {
          border: 1px solid #f0d28b;
          background: linear-gradient(135deg, #f0d28b, #bd9650 55%, #9c753c);
          color: #171126;
          box-shadow:
            0 8px 28px rgba(198, 161, 91, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }

        .arcana-button-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #fff0bd, #d8b56c 55%, #b38a49);
          box-shadow: 0 12px 34px rgba(215, 183, 110, 0.32);
        }

        .arcana-button-secondary {
          border: 1px solid rgba(215, 183, 110, 0.72);
          background: rgba(33, 25, 55, 0.78);
          color: var(--gold-light);
        }

        .arcana-button-secondary:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: var(--gold-light);
          background: rgba(76, 56, 104, 0.6);
          box-shadow: 0 8px 24px rgba(167, 139, 250, 0.12);
        }

        .arcana-button-primary:disabled,
        .arcana-button-secondary:disabled {
          cursor: not-allowed;
          opacity: 0.4;
          transform: none;
          box-shadow: none;
        }

        .arcana-deck {
          position: relative;
          width: 9rem;
          height: 12.5rem;
          isolation: isolate;
          filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.35));
        }

        .arcana-deck-card {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border: 1px solid #d7b76e;
          border-radius: 0.85rem;
          background:
            radial-gradient(circle at 50% 45%, rgba(167, 139, 250, 0.28), transparent 48%),
            linear-gradient(145deg, #342653, #151127 65%, #0c0a19);
          box-shadow:
            0 8px 18px rgba(0, 0, 0, 0.42),
            inset 0 0 0 4px rgba(215, 183, 110, 0.1),
            inset 0 0 0 6px rgba(215, 183, 110, 0.06);
          will-change: transform;
        }

        .arcana-deck-card-inner {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(215, 183, 110, 0.55);
          border-radius: 0.65rem;
          background:
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 12px,
              rgba(215, 183, 110, 0.025) 13px,
              rgba(215, 183, 110, 0.025) 14px
            );
        }

        .arcana-deck-symbol {
          display: flex;
          width: 75px;
          height: 75px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(215, 183, 110, 0.65);
          border-radius: 50%;
          color: var(--gold-light);
          font-size: 2.4rem;
          text-shadow: 0 0 22px rgba(215, 183, 110, 0.75);
          box-shadow:
            0 0 30px rgba(167, 139, 250, 0.2),
            inset 0 0 20px rgba(215, 183, 110, 0.08);
        }

        .arcana-deck.is-shuffling .arcana-deck-card {
          animation-duration: 0.95s;
          animation-timing-function: cubic-bezier(0.45, 0, 0.2, 1);
          animation-iteration-count: 2;
          animation-fill-mode: both;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(odd) {
          animation-name: shuffleCardLeft;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(even) {
          animation-name: shuffleCardRight;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(1) { animation-delay: 0ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(2) { animation-delay: 90ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(3) { animation-delay: 180ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(4) { animation-delay: 270ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(5) { animation-delay: 360ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(6) { animation-delay: 450ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(7) { animation-delay: 540ms; }
        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(8) { animation-delay: 630ms; }

        .arcana-result-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(215, 183, 110, 0.3);
          border-radius: 1.25rem;
          background:
            linear-gradient(155deg, rgba(43, 33, 69, 0.82), rgba(17, 14, 34, 0.96) 55%),
            #171329;
          padding: 1.25rem;
          box-shadow:
            0 16px 38px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);
          animation: cardAppear 0.75s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .arcana-result-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 15%;
          right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(215, 183, 110, 0.8), transparent);
        }

        .arcana-card-frame {
          position: relative;
          overflow: hidden;
          max-width: 12rem;
          margin: 1.5rem auto 0;
          border: 1px solid rgba(215, 183, 110, 0.58);
          border-radius: 0.85rem;
          background: #0b0918;
          box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.45),
            0 0 25px rgba(167, 139, 250, 0.1);
        }

        .arcana-card-frame img {
          display: block;
          width: 100%;
          height: auto;
        }

        .arcana-reveal-button {
          border: 1px solid rgba(215, 183, 110, 0.8);
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(119, 87, 153, 0.32), rgba(39, 29, 64, 0.9));
          padding: 0.8rem 1.7rem;
          color: #f5dfa4;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all 0.25s ease;
          box-shadow: 0 5px 20px rgba(167, 139, 250, 0.08);
        }

        .arcana-reveal-button:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #d7b76e, #a9854a);
          color: #171126;
          box-shadow: 0 8px 24px rgba(215, 183, 110, 0.2);
        }

        .arcana-summary {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(215, 183, 110, 0.5);
          border-radius: 1.5rem;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(119, 87, 153, 0.22), transparent 55%),
            linear-gradient(145deg, rgba(35, 27, 58, 0.98), rgba(13, 11, 28, 0.98));
          padding: 1.5rem;
          text-align: left;
          box-shadow:
            0 20px 65px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(215, 183, 110, 0.06);
        }

        .arcana-summary-item {
          border-left: 2px solid var(--gold);
          padding-left: 1rem;
        }

        .arcana-meaning-reveal {
          animation: meaningAppear 0.75s ease-out both;
        }

        .arcana-sticky-controls {
          border-bottom: 1px solid rgba(215, 183, 110, 0.15);
          background: rgba(10, 8, 25, 0.94);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(18px);
        }

        @keyframes shuffleCardLeft {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          18% {
            transform: translate3d(-13px, -25px, 0) rotate(-9deg);
          }
          42% {
            transform: translate3d(-34px, -17px, 0) rotate(-15deg);
          }
          68% {
            transform: translate3d(13px, -10px, 0) rotate(7deg);
          }
          86% {
            transform: translate3d(-5px, -4px, 0) rotate(-3deg);
          }
        }

        @keyframes shuffleCardRight {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          18% {
            transform: translate3d(13px, -25px, 0) rotate(9deg);
          }
          42% {
            transform: translate3d(34px, -17px, 0) rotate(15deg);
          }
          68% {
            transform: translate3d(-13px, -10px, 0) rotate(-7deg);
          }
          86% {
            transform: translate3d(5px, -4px, 0) rotate(3deg);
          }
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.96);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes meaningAppear {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (min-width: 640px) {
          .arcana-result-card {
            padding: 1.5rem;
          }

          .arcana-summary {
            padding: 2rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .arcana-deck.is-shuffling .arcana-deck-card {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
          }

          .arcana-result-card,
          .arcana-meaning-reveal {
            animation: none;
          }

          .arcana-topic,
          .arcana-button-primary,
          .arcana-button-secondary,
          .arcana-reveal-button {
            transition: none;
          }
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* HEADER */}
        <header className="arcana-header relative">
          <div className="arcana-mystic-orbit" />

          <div className="relative z-10">
            <div className="arcana-logo">
              <span>✦</span>
              <span>THE ARCANA</span>
              <span>✦</span>
            </div>

            <div className="mx-auto my-6 h-px w-28 bg-gradient-to-r from-transparent via-[#d7b76e] to-transparent" />

            <h1 className="arcana-title text-3xl sm:text-5xl">
              {mode === "one"
                ? "The Single Card"
                : mode === "celtic"
                  ? "The Celtic Cross"
                  : "The Threefold Path"}
            </h1>

            <p className="mt-5 text-lg font-medium tracking-wider text-[#e1c27d]">
              {mode === "one"
                ? "เปิดไพ่ทาโรต์ 1 ใบ"
                : mode === "celtic"
                  ? "กางเขนเซลติก · ไพ่ 10 ใบ"
                  : "เปิดไพ่ทาโรต์ 3 ใบ"}
            </p>

            <p className="arcana-subtitle mt-3 text-sm leading-7">
              {mode === "one"
                ? "ไพ่คำแนะนำสำหรับเส้นทางของคุณ"
                : mode === "celtic"
                  ? "สำรวจพลังงานและแนวโน้มในทุกมิติของชีวิต"
                  : "อดีต · ปัจจุบัน · อนาคต"}
            </p>
          </div>
        </header>

        {/* PERSONAL TAROT FORM */}
        <section className="arcana-panel mx-auto mt-5 max-w-xl p-5 text-left sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7b76e]/40 bg-[#d7b76e]/10 text-xl text-[#f5dfa4]">
              ✧
            </div>

            <div>
              <p className="text-xs tracking-[0.3em] text-[#d7b76e]">
                PERSONAL TAROT
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#fff4d8]">
                ข้อมูลของผู้เปิดไพ่
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[#bcb3d0]">
            กรอกข้อมูลของคุณเพื่อใช้ประกอบการสุ่มไพ่เฉพาะบุคคล
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="nickname"
                className="mb-2 block text-sm text-[#e1c27d]"
              >
                ชื่อเล่น
              </label>

              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={30}
                placeholder="กรอกชื่อเล่นของคุณ"
                autoComplete="nickname"
                className="arcana-input"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#e1c27d]">
                วันเกิด
              </label>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  placeholder="วัน"
                  aria-label="วันเกิด"
                  className="arcana-input min-w-0 text-center"
                />

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  placeholder="เดือน"
                  aria-label="เดือนเกิด"
                  className="arcana-input min-w-0 text-center"
                />

                <input
                  type="number"
                  min="2400"
                  max={new Date().getFullYear() + 543}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="พ.ศ."
                  aria-label="ปีเกิด พ.ศ."
                  className="arcana-input min-w-0 text-center"
                />
              </div>

              <p className="mt-2 text-xs text-[#8f8798]">
                กรุณากรอกวัน เดือน และปีเกิดเป็น พ.ศ.
              </p>
            </div>

            {(nickname || birthDay || birthMonth || birthYear) &&
              !isBirthdayValid && (
                <p
                  className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-sm text-rose-300"
                  role="alert"
                >
                  กรุณาตรวจสอบชื่อเล่นและวันเกิดให้ถูกต้อง
                </p>
              )}
          </div>
        </section>

        {/* เลือกหัวข้อคำทำนาย */}
        <section className="mx-auto mt-9 max-w-3xl">
          <div className="mb-5">
            <p className="text-xs tracking-[0.25em] text-[#d7b76e]">
              CHOOSE YOUR PATH
            </p>

            <h2 className="mt-2 text-lg font-medium text-[#f5e6c8]">
              เลือกหัวข้อที่ต้องการคำแนะนำ
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setReadingTopic(topic.id)}
                aria-pressed={readingTopic === topic.id}
                className={`arcana-topic px-3 py-4 ${
                  readingTopic === topic.id
                    ? "arcana-topic-active"
                    : ""
                }`}
              >
                <span className="block text-2xl">
                  {topic.icon}
                </span>

                <span className="mt-3 block text-sm font-medium">
                  {topic.label}
                </span>

                {readingTopic === topic.id && (
                  <span className="mt-2 block text-[10px] tracking-[0.2em] text-[#d7b76e]">
                    SELECTED
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ปุ่มเปิดไพ่ */}
        <div
          className={`mt-10 flex flex-col items-center gap-4 ${
            mode === "three" && drawnCards.length > 0
              ? "arcana-sticky-controls sticky top-0 z-30 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6"
              : ""
          }`}
        >
          {drawnCards.length === 0 ? (
            <>
              <div className="mb-2 text-center">
                <p className="text-xs tracking-[0.3em] text-[#d7b76e]">
                  THE SACRED DECK
                </p>

                <p className="mt-2 text-sm text-[#a99fbd]">
                  ตั้งสมาธิและเตรียมพร้อมสำหรับการเปิดไพ่
                </p>
              </div>

              <div
                className={`arcana-deck ${
                  isShuffling ? "is-shuffling" : ""
                }`}
                aria-label="สำรับไพ่ทาโรต์"
                aria-live="polite"
              >
                {Array.from({ length: 8 }, (_, card) => (
                  <div
                    key={card}
                    className="arcana-deck-card"
                    style={{
                      top: `${card * 1.5}px`,
                      left: `${card * 1.5}px`,
                    }}
                  >
                    <div className="arcana-deck-card-inner">
                      <span className="arcana-deck-symbol">
                        ✦
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={shuffleDeck}
                  disabled={isShuffling || !isBirthdayValid}
                  className="arcana-button-secondary w-full sm:w-auto"
                >
                  <span>✧</span>
                  {isShuffling ? "กำลังสับไพ่..." : "สับไพ่ใหม่"}
                </button>

                <button
                  type="button"
                  onClick={startDrawing}
                  disabled={!hasShuffled || isShuffling}
                  className="arcana-button-primary w-full sm:w-auto"
                >
                  <span>✦</span>
                  เริ่มหยิบไพ่
                </button>
              </div>

              <p
                className="mt-1 text-sm text-[#bcb3d0]"
                aria-live="polite"
              >
                {isShuffling
                  ? "กำลังสับไพ่ กรุณารอสักครู่"
                  : !isBirthdayValid
                    ? "กรุณากรอกชื่อเล่นและวันเกิดก่อนสับไพ่"
                    : hasShuffled
                      ? "สับไพ่เรียบร้อยแล้ว พร้อมเริ่มหยิบไพ่"
                      : "ข้อมูลพร้อมแล้ว กดสับไพ่เพื่อเริ่มต้น"}
              </p>
            </>
          ) : mode === "three" && drawnCards.length < 3 ? (
            <button
              type="button"
              onClick={revealNextCard}
              className="arcana-button-primary"
            >
              ✦ หยิบไพ่ใบที่ {drawnCards.length + 1}
            </button>
          ) : mode === "three" ? (
            <p className="text-sm font-medium tracking-wider text-[#e1c27d]">
              ✧ เปิดไพ่ครบทั้ง 3 ใบแล้ว ✧
            </p>
          ) : (
            <button
              type="button"
              onClick={restartReading}
              className="arcana-button-secondary"
            >
              ↻ สับไพ่และเริ่มอ่านใหม่
            </button>
          )}

          {mode === "three" && drawnCards.length > 0 && (
            <div
              className="flex items-center gap-2"
              aria-label={`เปิดไพ่แล้ว ${drawnCards.length} จาก 3 ใบ`}
            >
              {[0, 1, 2].map((step) => (
                <span
                  key={step}
                  className={`h-1.5 w-10 rounded-full transition-colors ${
                    step < drawnCards.length
                      ? "bg-[#d7b76e] shadow-[0_0_10px_rgba(215,183,110,0.5)]"
                      : "bg-[#8b7448]/30"
                  }`}
                />
              ))}

              <span className="ml-1 text-xs text-[#c8c0b2]">
                {drawnCards.length}/3 ใบ
              </span>
            </div>
          )}

          {mode === "three" && drawnCards.length === 3 && (
            <button
              type="button"
              onClick={restartReading}
              className="mt-1 text-sm text-[#bcb3d0] underline decoration-[#8b7448] underline-offset-4 transition hover:text-[#f5dfa4]"
            >
              เริ่มการหยิบไพ่ใหม่
            </button>
          )}
        </div>

        {/* คำแนะนำก่อนหยิบไพ่ */}
        {mode === "three" &&
          drawnCards.length > 0 &&
          drawnCards.length < 3 && (
            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#bcb3d0]">
              ค่อย ๆ ตั้งสมาธิกับคำถามของคุณ แล้วกดหยิบไพ่ทีละใบ
              ({drawnCards.length}/3 ใบ)
            </p>
          )}

        {/* ผลการเปิดไพ่ */}
        {drawnCards.length > 0 && (
          <div
            ref={mode === "three" ? readingResultRef : undefined}
            className="mt-10 scroll-mt-28"
          >
            <div className="mb-8 text-center">
              <p className="text-xs tracking-[0.35em] text-[#d7b76e]">
                YOUR CARDS
              </p>

              <h2 className="mt-3 text-2xl font-medium text-[#fff4d8]">
                ผลการเปิดไพ่
              </h2>

              <p className="mt-2 text-sm text-[#a99fbd]">
                {getTopicLabel(readingTopic)}
              </p>
            </div>

            {mode === "celtic" && (
              <div className="arcana-panel mx-auto mb-7 max-w-3xl p-4 text-center">
                <p className="text-sm leading-7 text-[#c8c0d7]">
                  ผัง Celtic Cross: ไพ่ใบที่ 2 แสดงแยกใต้ตำแหน่งปัจจุบันเพื่อให้อ่านง่าย
                  ส่วนไพ่ใบที่ 7–10 เรียงเป็นเสาด้านขวา
                </p>
              </div>
            )}

            <div
              className={
                "grid grid-cols-1 gap-5 " +
                (mode === "one"
                  ? "mx-auto max-w-md"
                  : mode === "celtic"
                    ? "lg:grid-cols-4 lg:grid-rows-[repeat(4,minmax(0,1fr))] lg:items-start lg:gap-5"
                    : "sm:grid-cols-3")
              }
            >
              {drawnCards.map((card, index) => {
                const tarotCard = tarotCards.find(
                  (item) => item.id === card.id
                );

                const meaning = getTarotMeaningById(card.id);

                const position =
                  mode === "one"
                    ? singlePosition
                    : activePositions[index];

                if (!tarotCard) {
                  return (
                    <div
                      key={card.id}
                      className="rounded-2xl border border-rose-400 bg-[#191622] p-6 text-rose-300"
                    >
                      ไม่พบข้อมูลไพ่ {card.name}
                    </div>
                  );
                }

                const interpretation = meaning
                  ? card.orientation === "upright"
                    ? meaning.upright
                    : meaning.reversed
                  : null;

                const isMeaningRevealed =
                  revealedMeaningIds.has(card.id);

                const celticPlacement =
                  mode !== "celtic"
                    ? ""
                    : [
                        "lg:col-start-2 lg:row-start-2",
                        "lg:col-start-2 lg:row-start-3",
                        "lg:col-start-2 lg:row-start-4",
                        "lg:col-start-1 lg:row-start-2",
                        "lg:col-start-2 lg:row-start-1",
                        "lg:col-start-3 lg:row-start-2",
                        "lg:col-start-4 lg:row-start-1",
                        "lg:col-start-4 lg:row-start-2",
                        "lg:col-start-4 lg:row-start-3",
                        "lg:col-start-4 lg:row-start-4",
                      ][index];

                return (
                  <article
                    key={card.id}
                    className={`arcana-result-card ${celticPlacement} ${
                      mode === "celtic" && index === 1
                        ? "border-[#d7b76e] shadow-[0_0_30px_rgba(198,161,91,0.2)]"
                        : ""
                    }`}
                  >
                    <p className="text-xs tracking-[0.2em] text-[#d7b76e]">
                      {position.english}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-[#fff4d8]">
                      {position.name}
                    </h2>

                    {/* หน้าไพ่แสดงก่อนเสมอ */}
                    <div className="arcana-card-frame">
                      <img
                        src={getTarotImagePath(tarotCard)}
                        alt={card.name}
                        className={`${
                          card.orientation === "reversed"
                            ? "rotate-180"
                            : ""
                        } ${
                          mode === "celtic" && index === 1
                            ? "lg:rotate-90"
                            : ""
                        }`}
                        style={{
                          animationDelay: "700ms",
                        }}
                      />
                    </div>

                    <p className="mt-5 text-lg font-semibold text-[#fff4d8]">
                      {card.name}
                    </p>

                    <p
                      className={`mt-2 text-sm ${
                        card.orientation === "upright"
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {card.orientation === "upright"
                        ? "ตั้งตรง · Upright"
                        : "กลับหัว · Reversed"}
                    </p>

                    {/* ส่วนคำอธิบาย: ซ่อนไว้ก่อน */}
                    <div className="mt-6 border-t border-[#8b7448]/40 pt-5">
                      {!meaning || !interpretation ? (
                        <p className="text-sm text-rose-300">
                          ยังไม่มีข้อมูลความหมายไพ่ใบนี้
                        </p>
                      ) : !isMeaningRevealed ? (
                        <div className="py-4 text-center">
                          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#d7b76e]/35 bg-[#d7b76e]/10 text-lg text-[#e1c27d]">
                            ✧
                          </div>

                          <p className="text-sm leading-7 text-[#bcb3d0]">
                            ใช้เวลาสักครู่เพื่อพิจารณาภาพไพ่
                            และความรู้สึกแรกที่เกิดขึ้นกับคุณ
                          </p>

                          <button
                            type="button"
                            onClick={() => revealMeaning(card.id)}
                            className="arcana-reveal-button mt-5"
                          >
                            ✧ เปิดคำทำนาย ✧
                          </button>
                        </div>
                      ) : (
                        <div className="arcana-meaning-reveal text-left">
                          <h3 className="text-sm font-semibold tracking-wider text-[#d7b76e]">
                            คำสำคัญ
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#e5d9c5]">
                            {meaning.keywords.join(" · ")}
                          </p>

                          <section className="mt-5">
                            <h3 className="font-semibold text-[#f0d28b]">
                              {getTopicLabel(readingTopic)}
                            </h3>

                            <p className="mt-2 text-sm leading-7 text-[#e5d9c5]">
                              {interpretation[readingTopic]}
                            </p>
                          </section>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* สรุปคำทำนาย: แสดงเมื่อเปิดคำอธิบายครบทุกใบ */}
            {allMeaningsOpened && (
              <section className="arcana-summary mx-auto mt-12 max-w-4xl arcana-meaning-reveal">
                <div className="text-center">
                  <p className="text-xs tracking-[0.35em] text-[#d7b76e]">
                    ✦ YOUR TAROT READING ✦
                  </p>

                  <h2 className="mt-4 text-2xl font-bold text-[#fff4d8] sm:text-3xl">
                    {mode === "one"
                      ? "สรุปคำทำนายไพ่ 1 ใบ"
                      : mode === "celtic"
                        ? "สรุปคำทำนายกางเขนเซลติก 10 ใบ"
                        : "สรุปคำทำนาย 3 ใบ"}
                  </h2>

                  <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-[#d7b76e] to-transparent" />

                  <p className="mt-4 text-sm text-[#d7b76e]">
                    หัวข้อที่เลือก: {getTopicLabel(readingTopic)}
                  </p>
                </div>

                <p className="mt-6 text-sm leading-8 text-[#c8c0d7]">
                  {mode === "one"
                    ? "พิจารณาความหมายของไพ่ใบนี้เป็นแนวทางสะท้อนสถานการณ์และทางเลือกของคุณ"
                    : mode === "celtic"
                      ? "อ่านไพ่ทั้ง 10 ใบตามตำแหน่งกางเขนเซลติก โดยพิจารณาความสัมพันธ์ระหว่างสถานการณ์ปัจจุบัน อุปสรรค รากฐาน อิทธิพลจากอดีต ปัจจัยแวดล้อม และผลลัพธ์ที่เป็นไปได้"
                      : "พิจารณาความหมายของไพ่แต่ละใบตามตำแหน่งอดีต ปัจจุบัน และอนาคต เพื่อสำรวจสถานการณ์และทางเลือกที่อาจมีความสำคัญกับคุณ"}
                </p>

                <div className="mt-8 space-y-7">
                  {drawnCards.map((card, index) => {
                    const meaning = getTarotMeaningById(card.id);

                    if (!meaning) {
                      return null;
                    }

                    const interpretation =
                      card.orientation === "upright"
                        ? meaning.upright
                        : meaning.reversed;

                    const position =
                      mode === "one"
                        ? singlePosition
                        : activePositions[index];

                    return (
                      <div
                        key={`summary-${card.id}`}
                        className="arcana-summary-item"
                      >
                        <h3 className="font-semibold leading-7 text-[#f0d28b]">
                          {position.name} — {card.name}
                        </h3>

                        <p className="mt-2 text-sm leading-8 text-[#e5d9c5]">
                          {interpretation[readingTopic]}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* คำแนะนำปิดท้าย */}
                <div className="mt-9 rounded-xl border border-[#8b7448]/40 bg-[#0c0a1b]/70 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-[#d7b76e]">
                      ✧
                    </span>

                    <h3 className="font-semibold text-[#f0d28b]">
                      คำแนะนำสำหรับคุณ
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-8 text-[#e5d9c5]">
                    {getAdvice(readingTopic)}
                  </p>

                  <p className="mt-5 border-t border-[#8b7448]/30 pt-4 text-xs leading-7 text-[#a99fbd]">
                    การอ่านไพ่เป็นเครื่องมือสำหรับการสำรวจตนเอง
                    ไม่ใช่การยืนยันอนาคต ควรใช้วิจารณญาณและข้อมูลจริง
                    ประกอบการตัดสินใจ
                  </p>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-xs tracking-[0.25em] text-[#d7b76e]">
                    THE ARCANA
                  </p>

                  <p className="mt-2 text-xs text-[#8f8798]">
                    May the cards guide your journey
                  </p>
                </div>
              </section>
            )}

            {/* แจ้งเตือนว่ายังเปิดคำอธิบายไม่ครบ */}
            {drawnCards.length > 0 && !allMeaningsOpened && (
              <div className="arcana-panel mx-auto mt-8 max-w-xl p-5 text-center">
                <span className="text-xl text-[#d7b76e]">✧</span>

                <p className="mt-2 text-sm leading-7 text-[#bcb3d0]">
                  เปิดคำทำนายของไพ่ให้ครบทุกใบ
                  เพื่อดูบทสรุปการอ่านไพ่ของคุณ
                </p>

                <p className="mt-2 text-xs text-[#8f8798]">
                  เปิดแล้ว {revealedMeaningIds.size} / {drawnCards.length} ใบ
                </p>
              </div>
            )}

            {/* กลับหน้าหลัก */}
            <div className="mt-10 text-center">
              <a
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#8b7448]/60 bg-[#191622]/60 px-7 py-3 text-sm text-[#c8c0b2] transition hover:border-[#d7b76e] hover:bg-[#c6a15b]/10 hover:text-[#f5dfa4]"
              >
                ← กลับหน้าหลัก
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Export หน้าเพจเพียงครั้งเดียว
 * Suspense ต้องอยู่ภายนอก ReadingContent
 */
export default function ReadingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#090817] text-[#f5e6c8]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-[#d7b76e]/50 text-2xl text-[#d7b76e]">
              ✦
            </div>

            <p className="text-sm tracking-wider text-[#c8c0b2]">
              กำลังเตรียมไพ่ทาโรต์...
            </p>
          </div>
        </main>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}