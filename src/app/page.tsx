
const tarotFeatures = [
  {
    number: "01",
    title: "ไพ่ใบเดียว",
    subtitle: "ONE CARD",
    description: "รับมุมมองสำหรับคำถามที่อยู่ในใจ",
    cards: "1 ใบ",
	href: "/reading?mode=one",
  },
  {
    number: "02",
    title: "อดีต ปัจจุบัน อนาคต",
    subtitle: "THREE CARDS",
    description: "สำรวจเรื่องราวและทิศทางที่กำลังดำเนินไป",
    cards: "3 ใบ",
	href: "/reading?mode=three",
  },
  {
    number: "03",
    title: "กางเขนเซลติก",
    subtitle: "CELTIC CROSS",
    description: "เจาะลึกสถานการณ์ด้วยไพ่ 10 ใบ",
    cards: "10 ใบ",
	href: "/reading?mode=celtic",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#100e17] text-[#f5e6c8]">
    <header className="sticky top-0 z-50 border-b border-[#c6a15b]/20 bg-[#100e17]/85 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="#" className="flex items-center gap-3">
            <span className="text-3xl text-[#d9bd7a]">✦</span>
            <span>
              <span className="block text-lg font-semibold tracking-[0.18em]">
                THE ARCANA
              </span>
              <span className="block text-[10px] tracking-[0.3em] text-[#b7a783]">
                RIDER–WAITE–SMITH
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-[#d1c6ad] md:flex">
            <a href="#about" className="transition hover:text-[#e4c77e]">
              เกี่ยวกับไพ่
            </a>
            <a href="#spreads" className="transition hover:text-[#e4c77e]">
              รูปแบบการเปิดไพ่
            </a>
          </nav>

          <a
            href="#spreads"
            className="rounded-full border border-[#c5a66a]/60 px-4 py-2 text-sm text-[#e4c77e] transition hover:bg-[#c5a66a]/10"
          >
            เริ่มเปิดไพ่
          </a>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#6752a3]/15 blur-3xl arcana-ambient" />

<div className="pointer-events-none absolute left-[15%] top-32 h-40 w-40 rounded-full bg-[#c6a15b]/10 blur-3xl arcana-ambient" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="mb-6 text-xs tracking-[0.35em] text-[#d9bd7a]">
              DISCOVER YOUR INNER WISDOM
            </p>

            <h1 className="text-4xl font-light leading-tight md:text-6xl">
              บางคำตอบ
              <br />
              <span className="font-semibold text-[#e4c77e]">
                อาจเริ่มต้น
              </span>
              <br />
              จากการตั้งคำถาม
            </h1>

            <p className="mt-7 max-w-lg leading-8 text-[#c5c0b5]">
              สำรวจความหมายของไพ่ทาโรต์ Rider–Waite–Smith
              ทั้ง 78 ใบ เพื่อค้นพบมุมมองใหม่เกี่ยวกับความรัก การงาน
              และเส้นทางชีวิตของคุณ
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#spreads"
                className="rounded-full bg-[#d9bd7a] px-7 py-3 font-semibold text-[#171525] transition hover:bg-[#edd89e]"
              >
                เริ่มต้นอ่านไพ่ <span aria-hidden="true">→</span>
              </a>
              <a
                href="#about"
                className="rounded-full border border-[#f5ecd9]/25 px-7 py-3 text-[#f5ecd9] transition hover:border-[#d9bd7a]"
              >
                ทำความรู้จักไพ่
              </a>
            </div>

            <div className="mt-10 flex gap-8 border-t border-[#f5ecd9]/10 pt-6">
              <div>
                <p className="text-2xl text-[#e4c77e]">78</p>
                <p className="mt-1 text-xs text-[#b7a783]">ไพ่ทั้งหมด</p>
              </div>
              <div>
                <p className="text-2xl text-[#e4c77e]">22</p>
                <p className="mt-1 text-xs text-[#b7a783]">Major Arcana</p>
              </div>
              <div>
                <p className="text-2xl text-[#e4c77e]">56</p>
                <p className="mt-1 text-xs text-[#b7a783]">Minor Arcana</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-6">
            
<div className="absolute h-64 w-64 rounded-full border border-[#d9bd7a]/30 arcana-ambient" />
<div className="arcana-orbit absolute h-80 w-80 rounded-full border border-dashed border-[#d9bd7a]/25" />


            

<div className="arcana-float arcana-gold-glow relative flex h-80 w-56 flex-col items-center rounded-2xl border border-[#e1c27d]/80 bg-gradient-to-b from-[#3b294d] via-[#21182f] to-[#100e17] p-3 shadow-2xl shadow-[#c6a15b]/20">


              <div className="flex h-full w-full flex-col items-center justify-between rounded-xl border border-[#d9bd7a]/40 px-4 py-5">
                <span className="text-xs tracking-[0.3em] text-[#d9bd7a]">
                  THE MYSTIC
                </span>
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[#d9bd7a]/50">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-[#d9bd7a]/50">
                    <span className="text-7xl text-[#e4c77e]">☼</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg tracking-[0.25em] text-[#f5ecd9]">
                    THE FOOL
                  </p>
                  <p className="mt-2 text-[10px] tracking-[0.2em] text-[#b7a783]">
                    A JOURNEY BEGINS
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute right-0 top-16 flex h-44 w-28 rotate-12 flex-col items-center justify-between rounded-xl border border-[#c5a66a]/60 bg-[#201d38] p-3 opacity-80 shadow-xl">
              <span className="text-[9px] tracking-widest text-[#d9bd7a]">
                ARCANA
              </span>
              <span className="text-5xl text-[#d9bd7a]">☾</span>
              <span className="text-[9px] text-[#d9bd7a]">XVIII</span>
            </div>

            <div className="absolute bottom-10 left-0 flex h-40 w-24 -rotate-12 flex-col items-center justify-between rounded-xl border border-[#c5a66a]/60 bg-[#201d38] p-3 opacity-80 shadow-xl">
              <span className="text-[9px] tracking-widest text-[#d9bd7a]">
                ARCANA
              </span>
              <span className="text-4xl text-[#d9bd7a]">✧</span>
              <span className="text-[9px] text-[#d9bd7a]">XVII</span>
            </div>
          </div>
        </div>
      </section>

      <section
  id="spreads"
  className="border-t border-[#8b7448]/30 bg-gradient-to-b from-[#15121e] to-[#100e17]"
>
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-[#d9bd7a]">
              CHOOSE YOUR PATH
            </p>
            <h2 className="mt-4 text-3xl font-light md:text-4xl">
              เลือกรูปแบบการเปิดไพ่
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-[#bcb9b2]">
              เริ่มต้นจากคำถามเล็ก ๆ หรือสำรวจสถานการณ์ในมุมที่ลึกขึ้น
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {tarotFeatures.map((feature) => (
              <a
  key={feature.number}
  href={feature.href}
  className={`arcana-luxury-card arcana-rise arcana-delay-${feature.number === "01" ? "1" : feature.number === "02" ? "2" : "3"} block rounded-2xl border border-[#8b7448]/40 bg-gradient-to-br from-[#292039] via-[#1c1728] to-[#121019] p-7 shadow-lg shadow-black/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1c27d]`}
>
                <div className="flex items-center justify-between">
                  <span className="text-3xl text-[#d9bd7a]">✧</span>
                  <span className="text-xs tracking-widest text-[#8f8a7e]">
                    {feature.number}
                  </span>
                </div>
                <p className="mt-7 text-xs tracking-[0.2em] text-[#d9bd7a]">
                  {feature.subtitle}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 min-h-14 leading-7 text-[#bcb9b2]">
                  {feature.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[#f5ecd9]/10 pt-5">
                  <span className="text-sm text-[#b7a783]">
                    {feature.cards}
                  </span>
                  <span className="text-sm text-[#d9bd7a]">
                    ตัวอย่างรูปแบบ
                  </span>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-7 text-center text-xs text-[#8f8a7e]">
            ขณะนี้เป็นหน้าแนะนำเว็บไซต์ ปุ่มเปิดไพ่จะใช้งานได้เมื่อเราสร้างระบบจริง
          </p>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="text-xs tracking-[0.25em] text-[#d9bd7a]">
              ABOUT THE TAROT
            </p>
            <h2 className="mt-4 text-2xl font-light leading-relaxed">
              ไพ่เป็นเครื่องมือ
              <br />
              สำหรับสำรวจมุมมอง
            </h2>
          </div>
          <p className="leading-8 text-[#bcb9b2] md:col-span-2">
            ไพ่ Rider–Waite–Smith ประกอบด้วย Major Arcana 22 ใบ และ Minor
            Arcana 56 ใบ เว็บไซต์นี้จะพัฒนาระบบอธิบายความหมายไพ่ภาษาไทย
            เพื่อช่วยให้คุณใช้การอ่านไพ่เป็นแนวทางในการทบทวนความคิดและทางเลือก
            ไม่ใช่การยืนยันอนาคตหรือข้อเท็จจริงที่แน่นอน
          </p>
        </div>
      </section>

      <footer className="border-t border-[#c5a66a]/20 px-6 py-7 text-center text-xs leading-6 text-[#8f8a7e]">
        <p>THE ARCANA · RIDER–WAITE–SMITH TAROT</p>
        <p>ใช้เพื่อการสะท้อนความคิดและความบันเทิง</p>
      </footer>
    </main>
  );
}
