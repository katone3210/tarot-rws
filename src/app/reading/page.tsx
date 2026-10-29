
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { tarotCards } from "@/data/tarot-cards";
import { getTarotImagePath } from "@/data/tarot-images";
import { getTarotMeaningById } from "@/data/meanings/all-meanings";

const positions = [
  { name: "อดีต", english: "PAST" },
  { name: "ปัจจุบัน", english: "PRESENT" },
  { name: "อนาคต", english: "FUTURE" },
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

/**
 * ส่วนแสดงผลไพ่
 * useSearchParams() อยู่ใน Component นี้
 * และจะถูกครอบด้วย Suspense จาก ReadingPage()
 */
function ReadingContent() {
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") === "one" ? "one" : "three";
  const cardCount = mode === "one" ? 1 : 3;

  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [readingTopic, setReadingTopic] =
    useState<ReadingTopic>("general");

  function drawCards() {
    const shuffled = [...tarotCards];

    // Fisher-Yates Shuffle: สุ่มลำดับไพ่โดยไม่แก้ไขสำรับต้นฉบับ
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // เลือกไพ่ไม่ซ้ำกัน พร้อมสุ่มสถานะตั้งตรงหรือกลับหัว
    const result: DrawnCard[] = shuffled
      .slice(0, cardCount)
      .map((card) => ({
        id: card.id,
        name: card.nameTh + " (" + card.nameEn + ")",
        orientation:
          Math.random() < 0.5 ? "upright" : "reversed",
      }));

    setDrawnCards(result);
  }

  return (
    <main className="min-h-screen bg-[#100e17] px-4 py-12 text-[#f5e6c8] sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        {/* ส่วนหัว */}
        <p className="text-sm tracking-[0.4em] text-[#c6a15b]">
          THE ARCANA
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          {mode === "one"
            ? "เปิดไพ่ทาโรต์ 1 ใบ"
            : "เปิดไพ่ทาโรต์ 3 ใบ"}
        </h1>

        <p className="mt-4 text-[#c8c0b2]">
          {mode === "one"
            ? "ไพ่คำแนะนำสำหรับคุณ"
            : "อดีต · ปัจจุบัน · อนาคต"}
        </p>

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
        <button
          type="button"
          onClick={drawCards}
          className="mt-8 rounded-full border border-[#c6a15b] bg-[#c6a15b] px-8 py-3 font-semibold text-[#100e17] transition hover:bg-[#e1c27d]"
        >
          {drawnCards.length > 0 ? "เปิดไพ่ชุดใหม่" : "เริ่มเปิดไพ่"}
        </button>

        {/* ผลการเปิดไพ่ */}
        {drawnCards.length > 0 && (
          <div className="mt-12">
            <div
              className={
  "grid grid-cols-1 gap-6 " +
  (mode === "one" ? "mx-auto max-w-md" : "sm:grid-cols-3")
}
            >
              {drawnCards.map((card, index) => {
                const tarotCard = tarotCards.find(
                  (item) => item.id === card.id
                );

                const meaning = getTarotMeaningById(card.id);

                const position =
                  mode === "one" ? singlePosition : positions[index];

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

                return (
                  <article
                    key={card.id}
                    className="rounded-2xl border border-[#8b7448] bg-[#191622] p-5 sm:p-6"
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
                        }`}
                        style={{
                          animationDelay: `${index * 700}ms`,
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
                  : "สรุปคำทำนาย 3 ใบ"}
              </h2>

              <p className="mt-2 text-sm text-[#c6a15b]">
                หัวข้อที่เลือก: {getTopicLabel(readingTopic)}
              </p>

              <p className="mt-3 leading-7 text-[#c8c0b2]">
                {mode === "one"
                  ? "พิจารณาความหมายของไพ่ใบนี้เป็นแนวทางสะท้อนสถานการณ์และทางเลือกของคุณ"
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
                    mode === "one" ? singlePosition : positions[index];

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
