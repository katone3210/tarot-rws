
import { tarotCards } from "@/data/tarot-cards";

export default function TarotTestPage() {
  const majorCards = tarotCards.filter(
    (card) => card.arcana === "major",
  );

  const minorCards = tarotCards.filter(
    (card) => card.arcana === "minor",
  );

  const uniqueIds = new Set(
    tarotCards.map((card) => card.id),
  );

  const isValid =
    tarotCards.length === 78 &&
    majorCards.length === 22 &&
    minorCards.length === 56 &&
    uniqueIds.size === 78;

  return (
    <main className="min-h-screen bg-[#0b1020] px-6 py-10 text-[#f5ecd9]">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm tracking-[0.25em] text-[#d9bd7a]">
          THE ARCANA · DATA CHECK
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          ตรวจสอบข้อมูลไพ่ Tarot
        </h1>

        <p className="mt-3 text-[#c5c0b5]">
          หน้านี้ใช้ตรวจสอบจำนวนไพ่และรหัสข้อมูลก่อนพัฒนาระบบสุ่มไพ่
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#d9bd7a]/30 p-5">
            <p className="text-sm text-[#b7a783]">ไพ่ทั้งหมด</p>
            <p className="mt-2 text-3xl">{tarotCards.length}</p>
            <p className="mt-1 text-sm">เป้าหมาย 78 ใบ</p>
          </div>

          <div className="rounded-xl border border-[#d9bd7a]/30 p-5">
            <p className="text-sm text-[#b7a783]">Major Arcana</p>
            <p className="mt-2 text-3xl">{majorCards.length}</p>
            <p className="mt-1 text-sm">เป้าหมาย 22 ใบ</p>
          </div>

          <div className="rounded-xl border border-[#d9bd7a]/30 p-5">
            <p className="text-sm text-[#b7a783]">Minor Arcana</p>
            <p className="mt-2 text-3xl">{minorCards.length}</p>
            <p className="mt-1 text-sm">เป้าหมาย 56 ใบ</p>
          </div>

          <div className="rounded-xl border border-[#d9bd7a]/30 p-5">
            <p className="text-sm text-[#b7a783]">รหัสไพ่ไม่ซ้ำ</p>
            <p className="mt-2 text-3xl">{uniqueIds.size}</p>
            <p className="mt-1 text-sm">เป้าหมาย 78 รหัส</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[#d9bd7a]/30 p-5">
          <h2 className="text-xl font-semibold">ผลตรวจสอบ</h2>

          <p
            className={`mt-3 font-semibold ${
              isValid ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isValid
              ? "ผ่าน: จำนวนไพ่และรหัสถูกต้อง"
              : "ไม่ผ่าน: กรุณาตรวจสอบข้อมูลไพ่"}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">รายการไพ่ทั้งหมด</h2>

          <div className="mt-4 overflow-x-auto rounded-xl border border-[#d9bd7a]/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#171d31] text-[#e4c77e]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">ชื่อไพ่</th>
                  <th className="px-4 py-3">ชื่อไทย</th>
                  <th className="px-4 py-3">ประเภท</th>
                  <th className="px-4 py-3">ชุด</th>
                </tr>
              </thead>

              <tbody>
                {tarotCards.map((card) => (
                  <tr
                    key={card.id}
                    className="border-t border-[#f5ecd9]/10"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      {card.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {card.nameEn}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {card.nameTh}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {card.arcana}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {card.suit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
