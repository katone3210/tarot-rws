
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

  // เวลาปัจจุบันระดับวินาที (HH:mm:ss)
  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const source =
    `${nickname.trim().toUpperCase()}|${day}|${month}|${year}|${time}|${attempt}`;

  // FNV-1a Hash
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

/**
 * ส่วนแสดงผลไพ่
 * useSearchParams() อยู่ใน Component นี้
 * และจะถูกครอบด้วย Suspense จาก ReadingPage()
 */
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

    // แปลง พ.ศ. เป็น ค.ศ. เพื่อตรวจสอบวันที่จริง
    const date = new Date(
      Date.UTC(year - 543, month - 1, day)
    );

    return (
      date.getUTCFullYear() === year - 543 &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  })();

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

    // เพิ่มเลขรอบการสับ เพื่อป้องกัน Seed ซ้ำ
    shuffleAttemptRef.current += 1;

    // สร้าง Personal Seed
    const seed = createPersonalSeed(
      nickname,
      birthDay,
      birthMonth,
      birthYear,
      shuffleAttemptRef.current
    );

    // สร้างตัวสุ่มจาก Seed
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
    setHasShuffled(false);
    setIsShuffling(false);
  }

  return (
    <main className="min-h-screen bg-[#100e17] px-4 py-12 text-[#f5e6c8] sm:px-6">
      <style jsx>{`
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

        .arcana-deck {
          position: relative;
          width: 9rem;
          height: 12.5rem;
          isolation: isolate;
        }

        .arcana-deck-card {
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          border: 2px solid #c6a15b;
          background: #191622;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
          will-change: transform;
        }

        .arcana-deck-card:nth-child(1) { z-index: 1; }
        .arcana-deck-card:nth-child(2) { z-index: 2; }
        .arcana-deck-card:nth-child(3) { z-index: 3; }
        .arcana-deck-card:nth-child(4) { z-index: 4; }
        .arcana-deck-card:nth-child(5) { z-index: 5; }
        .arcana-deck-card:nth-child(6) { z-index: 6; }
        .arcana-deck-card:nth-child(7) { z-index: 7; }
        .arcana-deck-card:nth-child(8) { z-index: 8; }

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

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(1) {
          animation-delay: 0ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(2) {
          animation-delay: 90ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(3) {
          animation-delay: 180ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(4) {
          animation-delay: 270ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(5) {
          animation-delay: 360ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(6) {
          animation-delay: 450ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(7) {
          animation-delay: 540ms;
        }

        .arcana-deck.is-shuffling .arcana-deck-card:nth-child(8) {
          animation-delay: 630ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .arcana-deck.is-shuffling .arcana-deck-card {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl text-center">
        {/* ส่วนหัว */}
        <p className="text-sm tracking-[0.4em] text-[#c6a15b]">
          THE ARCANA
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          {mode === "one"
            ? "เปิดไพ่ทาโรต์ 1 ใบ"
            : mode === "celtic"
              ? "กางเขนเซลติก · ไพ่ 10 ใบ"
              : "เปิดไพ่ทาโรต์ 3 ใบ"}
        </h1>

        <p className="mt-4 text-[#c8c0b2]">
          {mode === "one"
            ? "ไพ่คำแนะนำสำหรับคุณ"
            : mode === "celtic"
              ? "สำรวจสถานการณ์ อุปสรรค ปัจจัยแวดล้อม และแนวโน้มโดยรวม"
              : "อดีต · ปัจจุบัน · อนาคต"}
        </p>

        {/* Personal Tarot Form */}
        <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#8b7448] bg-[#191622] p-5 text-left sm:p-7">
          <p className="text-sm tracking-[0.3em] text-[#c6a15b]">
            PERSONAL TAROT
          </p>

          <h2 className="mt-3 text-xl font-semibold">
            ข้อมูลของผู้เปิดไพ่
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#c8c0b2]">
            กรอกข้อมูลของคุณเพื่อใช้ประกอบการสุ่มไพ่เฉพาะบุคคล
          </p>

          <div className="mt-6 space-y-5">
            {/* ชื่อเล่น */}
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
                className="w-full rounded-xl border border-[#8b7448]/60 bg-[#100e17] px-4 py-3 text-[#f5e6c8] outline-none placeholder:text-[#777080] focus:border-[#c6a15b]"
              />
            </div>

            {/* วันเกิด */}
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
                  className="min-w-0 w-full rounded-xl border border-[#8b7448]/60 bg-[#100e17] px-3 py-3 text-center text-[#f5e6c8] outline-none focus:border-[#c6a15b]"
                />

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  placeholder="เดือน"
                  aria-label="เดือนเกิด"
                  className="min-w-0 w-full rounded-xl border border-[#8b7448]/60 bg-[#100e17] px-3 py-3 text-center text-[#f5e6c8] outline-none focus:border-[#c6a15b]"
                />

                <input
                  type="number"
                  min="2400"
                  max={new Date().getFullYear() + 543}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="พ.ศ."
                  aria-label="ปีเกิด พ.ศ."
                  className="min-w-0 w-full rounded-xl border border-[#8b7448]/60 bg-[#100e17] px-3 py-3 text-center text-[#f5e6c8] outline-none focus:border-[#c6a15b]"
                />
              </div>

              <p className="mt-2 text-xs text-[#8f8798]">
                กรุณากรอกวัน เดือน และปีเกิดเป็น พ.ศ.
              </p>
            </div>

            {/* ข้อความแจ้งเตือน */}
            {(nickname || birthDay || birthMonth || birthYear) &&
              !isBirthdayValid && (
                <p className="text-sm text-rose-300">
                  กรุณาตรวจสอบชื่อเล่นและวันเกิดให้ถูกต้อง
                </p>
              )}
          </div>
        </section>

        {/* เลือกหัวข้อคำทำนาย */}
        <section className="mt-8">
          <p className="mb-4 text-sm text-[#c8c0b2]">
            เลือกหัวข้อที่ต้องการคำแนะนำ
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setReadingTopic(topic.id)}
                aria-pressed={readingTopic === topic.id}
                className={
                  "rounded-xl border px-3 py-4 transition " +
                  (readingTopic === topic.id
                    ? "border-[#c6a15b] bg-[#c6a15b]/15 text-[#e1c27d]"
                    : "border-[#8b7448]/50 bg-[#191622] text-[#c8c0b2] hover:border-[#c6a15b]")
                }
              >
                <span className="block text-xl">{topic.icon}</span>

                <span className="mt-2 block text-sm font-medium">
                  {topic.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ปุ่มเปิดไพ่ */}
        <div
          className={`mt-8 flex flex-col items-center gap-3 ${
            mode === "three" && drawnCards.length > 0
              ? "sticky top-0 z-30 -mx-4 bg-[#100e17]/95 px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.3)] backdrop-blur sm:-mx-6 sm:px-6"
              : ""
          }`}
        >
          {drawnCards.length === 0 ? (
            <>
              {/* สำรับไพ่ */}
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
                    <div className="flex h-full items-center justify-center rounded-xl border border-[#8b7448]/70">
                      <span className="text-4xl text-[#c6a15b]">
                        ✦
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ปุ่มสับไพ่ใหม่ */}
              <button
                type="button"
                onClick={shuffleDeck}
                disabled={isShuffling || !isBirthdayValid}
                className="rounded-full border border-[#c6a15b] px-8 py-3 font-semibold text-[#e1c27d] transition hover:bg-[#c6a15b]/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isShuffling ? "กำลังสับไพ่..." : "สับไพ่ใหม่"}
              </button>

              {/* ปุ่มเริ่มหยิบไพ่ */}
              <button
                type="button"
                onClick={startDrawing}
                disabled={!hasShuffled || isShuffling}
                className="rounded-full border border-[#c6a15b] bg-[#c6a15b] px-8 py-3 font-semibold text-[#100e17] transition hover:bg-[#e1c27d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                เริ่มหยิบไพ่
              </button>

              {/* สถานะการสับไพ่ */}
              <p className="text-sm text-[#c8c0b2]" aria-live="polite">
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
              className="rounded-full border border-[#c6a15b] bg-[#c6a15b] px-8 py-3 font-semibold text-[#100e17] transition hover:bg-[#e1c27d]"
            >
              {`หยิบไพ่ใบที่ ${drawnCards.length + 1}`}
            </button>
          ) : mode === "three" ? (
            <p className="text-sm text-[#e1c27d]">
              เปิดไพ่ครบทั้ง 3 ใบแล้ว
            </p>
          ) : (
            <button
              type="button"
              onClick={restartReading}
              className="rounded-full border border-[#c6a15b] px-8 py-3 text-[#e1c27d] transition hover:bg-[#c6a15b]/10"
            >
              สับไพ่และเริ่มอ่านใหม่
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
                      ? "bg-[#c6a15b]"
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
              className="mt-1 text-sm text-[#c8c0b2] underline decoration-[#8b7448] underline-offset-4 hover:text-[#e1c27d]"
            >
              เริ่มการหยิบไพ่ใหม่
            </button>
          )}
        </div>

        {/* ผลการเปิดไพ่ */}
        {mode === "three" &&
          drawnCards.length > 0 &&
          drawnCards.length < 3 && (
            <p className="mt-6 text-sm leading-6 text-[#c8c0b2]">
              ค่อย ๆ ตั้งสมาธิกับคำถามของคุณ แล้วกดหยิบไพ่ทีละใบ
              ({drawnCards.length}/3 ใบ)
            </p>
          )}

        {drawnCards.length > 0 && (
          <div
            ref={mode === "three" ? readingResultRef : undefined}
            className="mt-8 scroll-mt-28"
          >
            {mode === "celtic" && (
              <p className="mb-6 text-center text-xs leading-6 text-[#c8c0b2]">
                ผัง Celtic Cross: ไพ่ใบที่ 2 แสดงแยกใต้ตำแหน่งปัจจุบันเพื่อให้อ่านง่าย
                ส่วนไพ่ใบที่ 7–10 เรียงเป็นเสาด้านขวา
              </p>
            )}

            <div
              className={
                "grid grid-cols-1 gap-6 " +
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
                    className={`rounded-2xl border border-[#8b7448] bg-[#191622] p-4 sm:p-5 ${celticPlacement} ${
                      mode === "celtic" && index === 1
                        ? "border-[#c6a15b] shadow-[0_0_24px_rgba(198,161,91,0.2)]"
                        : ""
                    }`}
                  >
                    <p className="text-sm tracking-[0.25em] text-[#c6a15b]">
                      {position.english}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      {position.name}
                    </h2>

                    <div className="mx-auto mt-6 w-full max-w-48">
                      <img
                        src={getTarotImagePath(tarotCard)}
                        alt={card.name}
                        className={`arcana-card-reveal w-full rounded-xl border border-[#8b7448] shadow-lg ${
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

                    <p className="mt-5 text-lg font-semibold">
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

                    {!meaning || !interpretation ? (
                      <p className="mt-5 text-sm text-rose-300">
                        ยังไม่มีข้อมูลความหมายไพ่ใบนี้
                      </p>
                    ) : (
                      <div className="mt-6 border-t border-[#8b7448]/50 pt-5 text-left">
                        <section>
                          <h3 className="text-sm font-semibold text-[#c6a15b]">
                            คำสำคัญ
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#e5d9c5]">
                            {meaning.keywords.join(" · ")}
                          </p>
                        </section>

                        {/* แสดงความหมายตามหัวข้อที่เลือก */}
                        <section className="mt-5">
                          <h3 className="font-semibold text-[#c6a15b]">
                            {getTopicLabel(readingTopic)}
                          </h3>

                          <p className="mt-2 text-sm leading-7 text-[#e5d9c5]">
                            {interpretation[readingTopic]}
                          </p>
                        </section>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {/* สรุปคำทำนาย */}
            <section className="mt-12 rounded-2xl border border-[#8b7448] bg-[#191622] p-6 text-left sm:p-8">
              <p className="text-sm tracking-[0.3em] text-[#c6a15b]">
                YOUR TAROT READING
              </p>

              <h2 className="mt-3 text-2xl font-bold text-[#f5e6c8]">
                {mode === "one"
                  ? "สรุปคำทำนายไพ่ 1 ใบ"
                  : mode === "celtic"
                    ? "สรุปคำทำนายกางเขนเซลติก 10 ใบ"
                    : "สรุปคำทำนาย 3 ใบ"}
              </h2>

              <p className="mt-2 text-sm text-[#c6a15b]">
                หัวข้อที่เลือก: {getTopicLabel(readingTopic)}
              </p>

              <p className="mt-3 leading-7 text-[#c8c0b2]">
                {mode === "one"
                  ? "พิจารณาความหมายของไพ่ใบนี้เป็นแนวทางสะท้อนสถานการณ์และทางเลือกของคุณ"
                  : mode === "celtic"
                    ? "อ่านไพ่ทั้ง 10 ใบตามตำแหน่งกางเขนเซลติก โดยพิจารณาความสัมพันธ์ระหว่างสถานการณ์ปัจจุบัน อุปสรรค รากฐาน อิทธิพลจากอดีต ปัจจัยแวดล้อม และผลลัพธ์ที่เป็นไปได้"
                    : "พิจารณาความหมายของไพ่แต่ละใบตามตำแหน่งอดีต ปัจจุบัน และอนาคต เพื่อสำรวจสถานการณ์และทางเลือกที่อาจมีความสำคัญกับคุณ"}
              </p>

              <div className="mt-6 space-y-6">
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
                      className="border-l-2 border-[#c6a15b] pl-4"
                    >
                      <h3 className="font-semibold text-[#c6a15b]">
                        {position.name} — {card.name}
                      </h3>

                      <p className="mt-2 leading-7 text-[#e5d9c5]">
                        {interpretation[readingTopic]}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* คำแนะนำปิดท้าย */}
              <div className="mt-6 rounded-xl border border-[#8b7448]/50 bg-[#100e17] p-5">
                <h3 className="font-semibold text-[#c6a15b]">
                  คำแนะนำสำหรับคุณ
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#e5d9c5]">
                  {getAdvice(readingTopic)}
                </p>

                <p className="mt-4 border-t border-[#8b7448]/40 pt-3 text-xs leading-6 text-[#c8c0b2]">
                  การอ่านไพ่เป็นเครื่องมือสำหรับการสำรวจตนเอง
                  ไม่ใช่การยืนยันอนาคต ควรใช้วิจารณญาณและข้อมูลจริง
                  ประกอบการตัดสินใจ
                </p>
              </div>
            </section>

            {/* กลับหน้าหลัก */}
            <div className="mt-8 text-center">
              <a
                href="/"
                className="inline-flex rounded-full border border-[#8b7448]/60 px-6 py-3 text-sm text-[#c8c0b2] transition hover:border-[#c6a15b] hover:bg-[#c6a15b]/10 hover:text-[#e1c27d]"
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
        <main className="flex min-h-screen items-center justify-center bg-[#100e17] text-[#f5e6c8]">
          <p>กำลังเตรียมไพ่ทาโรต์...</p>
        </main>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}
