"use client";

import { useState } from "react";
import Link from "next/link";
import { tarotCards, type TarotCard } from "@/data/tarot-cards";
import { getTarotMeaningById } from "@/data/meanings/all-meanings";

function shuffleCards(cards: TarotCard[]): TarotCard[] {
  const shuffled = [...cards];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

type DrawnCard = {
  card: TarotCard;
  orientation: "upright" | "reversed";
};

export default function DrawTestPage() {
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [drawCount, setDrawCount] = useState(0);

  function drawThreeCards() {
    const shuffled = shuffleCards(tarotCards);
    const selected = shuffled.slice(0, 3);

    const cardsWithOrientation: DrawnCard[] = selected.map((card) => ({
      card,
      orientation: Math.random() < 0.5 ? "upright" : "reversed",
    }));

    setDrawnCards(cardsWithOrientation);
    setDrawCount((count) => count + 1);
  }

  const hasNoDuplicates =
    new Set(drawnCards.map((item) => item.card.id)).size ===
    drawnCards.length;

  return (
    <main className="min-h-screen bg-[#0b1020] px-6 py-12 text-[#f5ecd9]">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs tracking-[0.3em] text-[#d9bd7a]">
          THE ARCANA · SHUFFLE TEST
        </p>

        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
          ทดลองสุ่มไพ่ Tarot
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-[#c5c0b5]">
          สุ่มไพ่ Rider–Waite–Smith 3 ใบจากสำรับ 78 ใบ
          พร้อมแสดงความหมายตามสถานะไพ่ตั้งตรงหรือกลับหัว
        </p>

        <button
          type="button"
          onClick={drawThreeCards}
          className="mt-8 rounded-full bg-[#d9bd7a] px-7 py-3 font-semibold text-[#171525] transition hover:bg-[#edd89e]"
        >
          สุ่มไพ่ 3 ใบ
        </button>

        <p className="mt-4 text-sm text-[#b7a783]">
          จำนวนครั้งที่สุ่ม: {drawCount}
        </p>

        {drawnCards.length > 0 && (
          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">ไพ่ที่สุ่มได้</h2>

              <span
                className={
                  hasNoDuplicates
                    ? "text-sm text-emerald-400"
                    : "text-sm text-red-400"
                }
              >
                {hasNoDuplicates
                  ? "ตรวจสอบแล้ว: ไม่มีไพ่ซ้ำ"
                  : "พบไพ่ซ้ำ กรุณาตรวจสอบ"}
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {drawnCards.map((drawnCard, index) => {
                const meaning = getTarotMeaningById(drawnCard.card.id);

                const orientationMeaning =
                  meaning?.[drawnCard.orientation];

                return (
                  <article
                    key={drawnCard.card.id}
                    className="rounded-2xl border border-[#d9bd7a]/40 bg-[#151b30] p-5"
                  >
                    <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-[#d9bd7a]/30 bg-gradient-to-b from-[#29264a] to-[#101426] p-4 text-center">
                      <span className="text-xs tracking-[0.25em] text-[#d9bd7a]">
                        CARD {index + 1}
                      </span>

                      <span className="mt-8 text-6xl text-[#e4c77e]">
                        ✧
                      </span>

                      <p className="mt-8 text-lg font-semibold">
                        {drawnCard.card.nameEn}
                      </p>

                      <p className="mt-2 text-sm text-[#d9bd7a]">
                        {drawnCard.card.nameTh}
                      </p>

                      <p
                        className={`mt-3 rounded-full px-3 py-1 text-sm font-semibold ${
                          drawnCard.orientation === "upright"
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "bg-red-900/40 text-red-300"
                        }`}
                      >
                        {drawnCard.orientation === "upright"
                          ? "↑ ตั้งตรง (Upright)"
                          : "↓ กลับหัว (Reversed)"}
                      </p>
                    </div>

                    <p className="mt-4 text-sm text-[#b7a783]">
                      รหัสไพ่: {drawnCard.card.id}
                    </p>

                    <p className="mt-1 text-sm text-[#b7a783]">
                      ประเภท:{" "}
                      {drawnCard.card.arcana === "major"
                        ? "Major Arcana"
                        : "Minor Arcana"}
                    </p>

                    <p className="mt-1 text-sm text-[#b7a783]">
                      ชุดไพ่: {drawnCard.card.suit}
                    </p>

                    <div className="mt-5 border-t border-[#d9bd7a]/20 pt-4">
                      <h3 className="text-lg font-semibold text-[#e4c77e]">
                        คำทำนาย
                      </h3>

                      {meaning && orientationMeaning ? (
                        <>
                          <p className="mt-3 text-sm leading-6 text-[#d9bd7a]">
                            คำสำคัญ: {meaning.keywords.join(" · ")}
                          </p>

                          <div className="mt-4 space-y-4">
                            <div>
                              <h4 className="font-semibold">ภาพรวม</h4>
                              <p className="mt-1 text-sm leading-6 text-[#c5c0b5]">
                                {orientationMeaning.general}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold">ความรัก</h4>
                              <p className="mt-1 text-sm leading-6 text-[#c5c0b5]">
                                {orientationMeaning.love}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold">การงาน</h4>
                              <p className="mt-1 text-sm leading-6 text-[#c5c0b5]">
                                {orientationMeaning.career}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold">การเงิน</h4>
                              <p className="mt-1 text-sm leading-6 text-[#c5c0b5]">
                                {orientationMeaning.finance}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-sm leading-6 text-[#c5c0b5]">
                          ไพ่ใบนี้ยังไม่มีข้อมูลคำทำนายในระบบ
                          เราจะเพิ่มความหมายของ Minor Arcana ในขั้นตอนถัดไป
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {drawnCards.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-[#d9bd7a]/30 p-10 text-center">
            <span className="text-5xl text-[#d9bd7a]">✧</span>
            <p className="mt-4 text-[#c5c0b5]">
              กดปุ่มด้านบนเพื่อสุ่มไพ่ชุดแรก
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-10 inline-block text-sm text-[#d9bd7a] underline underline-offset-4"
        >
          ← กลับหน้าแรก
        </Link>
      </div>
    </main>
  );
}
