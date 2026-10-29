
import { getMajorArcanaMeaning } from "@/data/meanings/major-arcana";

export default function MeaningTestPage() {
  const meaning = getMajorArcanaMeaning("major-00");

  if (!meaning) {
    return (
      <main className="min-h-screen bg-[#0b1020] p-8 text-white">
        <h1 className="text-2xl font-bold text-red-400">
          ไม่พบความหมายไพ่
        </h1>
        <p className="mt-4">รหัสไพ่: major-00</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1020] p-8 text-[#f5ecd9]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm tracking-widest text-[#d9bd7a]">
          THE ARCANA · MEANING TEST
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          The Fool — คนพเนจร
        </h1>

        <p className="mt-2 text-sm text-[#b7a783]">
          รหัสไพ่: {meaning.cardId}
        </p>

        <section className="mt-8 rounded-xl border border-[#d9bd7a]/40 p-5">
          <h2 className="text-xl font-semibold text-[#d9bd7a]">
            คำสำคัญ
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {meaning.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-[#29264a] px-3 py-1 text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-emerald-500/40 p-5">
            <h2 className="text-xl font-semibold text-emerald-300">
              ↑ ตั้งตรง (Upright)
            </h2>

            <div className="mt-4 space-y-4">
              <p><strong>ภาพรวม:</strong> {meaning.upright.general}</p>
              <p><strong>ความรัก:</strong> {meaning.upright.love}</p>
              <p><strong>การงาน:</strong> {meaning.upright.career}</p>
              <p><strong>การเงิน:</strong> {meaning.upright.finance}</p>
            </div>
          </article>

          <article className="rounded-xl border border-red-500/40 p-5">
            <h2 className="text-xl font-semibold text-red-300">
              ↓ กลับหัว (Reversed)
            </h2>

            <div className="mt-4 space-y-4">
              <p><strong>ภาพรวม:</strong> {meaning.reversed.general}</p>
              <p><strong>ความรัก:</strong> {meaning.reversed.love}</p>
              <p><strong>การงาน:</strong> {meaning.reversed.career}</p>
              <p><strong>การเงิน:</strong> {meaning.reversed.finance}</p>
            </div>
          </article>
        </section>

        <a
          href="/draw-test"
          className="mt-8 inline-block text-[#d9bd7a] underline"
        >
          กลับไปหน้าทดลองสุ่มไพ่
        </a>
      </div>
    </main>
  );
}
