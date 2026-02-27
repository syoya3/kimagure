"use client";

import { useEffect } from "react";

const bizCards = [
  {
    num: "01",
    title: "Web開発",
    desc: "企業サイト・採用サイト・業務アプリまで。情報設計とUIで成果を両立。",
    bg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  },
  {
    num: "02",
    title: "AI導入支援",
    desc: "業務フローに合わせたAI活用設計、社内実装、定着支援まで伴走。",
    bg: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
  },
  {
    num: "03",
    title: "DXコンサルティング",
    desc: "現場課題を可視化し、ROI重視のデジタル施策を優先順位付きで提案。",
    bg: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
  },
  {
    num: "04",
    title: "アプリ開発",
    desc: "業務アプリから顧客向けまで。iOS/Android/Webを使いやすさ重視で構築。",
    bg: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
  },
];

const infoItems = [
  { date: "2026.02.27", tag: "お知らせ", text: "コーポレートサイトをリニューアルしました。" },
  { date: "2026.02.15", tag: "実績", text: "導入社数120社を突破しました。" },
  { date: "2026.01.10", tag: "お知らせ", text: "AI導入支援サービスを開始しました。" },
];

export default function Home() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[clamp(20px,3vw,40px)] py-5 mix-blend-difference">
        <a href="#" className="flex items-center gap-2 text-white font-black text-base tracking-wide no-underline">
          <span className="w-8 h-8 bg-[--accent] rounded grid place-items-center text-[#111] font-black text-sm mix-blend-normal">
            木
          </span>
          まぐれ
        </a>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6">
            {["事業内容", "私たちについて", "お知らせ"].map((label, i) => (
              <a
                key={i}
                href={["#business", "#about", "#info"][i]}
                className="font-oswald text-white text-xs font-medium tracking-widest no-underline"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            className="font-oswald bg-[--accent] text-[#111] px-6 py-2.5 text-xs font-bold tracking-widest no-underline mix-blend-normal"
          >
            CONTACT
          </a>
        </div>
      </header>

      {/* Side nav dots */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 flex-col gap-3 z-50 hidden md:flex">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full border transition-all cursor-pointer ${
              i === 0
                ? "bg-[--accent] border-[--accent]"
                : "bg-transparent border-black/15"
            }`}
          />
        ))}
      </div>

      {/* HERO */}
      <section className="relative h-screen overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(13,17,23,0.9)] via-[rgba(26,32,48,0.7)] to-[rgba(10,14,20,0.85)]" />
        </div>
        <div className="font-oswald absolute bottom-[5%] right-[-2%] text-[clamp(80px,15vw,220px)] font-black text-white/[.03] tracking-wide leading-none whitespace-nowrap pointer-events-none">
          TECHNOLOGY
          <br />
          AREA.
        </div>
        <div className="relative z-[1] text-left px-[clamp(24px,5vw,80px)] max-w-[1400px] w-full">
          <div className="font-oswald text-[clamp(12px,1.2vw,16px)] text-[--accent] font-bold tracking-[.15em] mb-5">
            KIMAGURE Inc.
          </div>
          <h1 className="text-[clamp(28px,4vw,56px)] font-black text-white leading-[1.3] tracking-wide mb-6">
            テクノロジーで、
            <br />
            この<em className="not-italic text-[--accent]">成長</em>を
            <br />
            加速させる。
          </h1>
          <p className="text-[clamp(13px,1vw,15px)] text-white/45 max-w-[500px] leading-8 mb-10">
            Web開発・AI導入・DX支援を通じて、企業と人の可能性を最大化する。確かな技術と情報設計で、成果につながるデジタル基盤を。
          </p>
          <a
            href="#contact"
            className="font-oswald inline-flex items-center gap-3 bg-[--accent] text-[#111] px-10 py-4 text-sm font-bold tracking-wide no-underline hover:bg-[--accent-dark] transition-all"
          >
            お問い合わせ <span className="text-lg">→</span>
          </a>
        </div>
        <a
          href="#"
          className="font-oswald absolute right-0 bottom-[15%] z-[2] bg-[--accent] px-8 py-4 flex items-center gap-3 no-underline text-[#111] text-xs font-bold tracking-[.1em] hover:bg-[--accent-dark] transition-colors hidden md:flex"
        >
          RECRUIT — 採用情報
        </a>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[2]">
          <span className="text-[9px] text-white/30 tracking-[.2em]" style={{ writingMode: "vertical-rl" }}>
            SCROLL
          </span>
          <div className="scroll-bar w-px h-[50px] bg-white/10 relative overflow-hidden" />
        </div>
      </section>

      {/* BUSINESS */}
      <section className="py-[clamp(80px,10vw,160px)] px-[clamp(24px,5vw,80px)] bg-white relative overflow-hidden" id="business">
        <div className="font-oswald absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(60px,12vw,180px)] font-black text-black/[.02] tracking-[.1em] whitespace-nowrap pointer-events-none">
          LEADING
        </div>
        <div className="max-w-[1200px] mx-auto relative z-[1]">
          <div className="text-center mb-[clamp(40px,5vw,80px)] reveal">
            <div className="font-oswald text-[11px] font-semibold text-[--text-sub] tracking-[.2em] mb-10">
              BUSINESS
            </div>
            <h2 className="text-[clamp(22px,2.5vw,36px)] font-bold leading-relaxed tracking-wide">
              確かな技術と、柔軟な設計が、
              <br />
              IT企業としての実績を支えています。
            </h2>
            <p className="text-sm text-[--text-sub] mt-4 leading-8 max-w-[600px] mx-auto">
              Web・AI・DXの3領域を軸に、課題整理から設計・開発・運用まで一気通貫で支援。企業の成長フェーズに合わせた最適解を提供します。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 reveal">
            {bizCards.map((card) => (
              <div
                key={card.num}
                className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-[--dark] group"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-50 transition-transform duration-[600ms] group-hover:scale-105"
                  style={{ backgroundImage: `url('${card.bg}')` }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-[clamp(20px,3vw,40px)] z-[1]">
                  <div className="font-oswald text-5xl font-bold text-[--accent] opacity-50 leading-none mb-2">
                    {card.num}
                  </div>
                  <h3 className="text-[clamp(18px,1.5vw,24px)] font-bold text-white mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-white/50 leading-[1.8] max-w-[360px]">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="py-[clamp(80px,10vw,160px)] px-[clamp(24px,5vw,80px)] bg-[--gray] relative overflow-hidden">
        <div className="font-oswald absolute top-[40%] left-[-5%] text-[clamp(60px,12vw,180px)] font-black text-black/[.02] tracking-widest whitespace-nowrap pointer-events-none">
          PERFORMANCE
        </div>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-[clamp(40px,5vw,64px)] reveal">
            <div className="font-oswald text-[11px] font-semibold text-[--text-sub] tracking-[.2em] mb-4">
              PERFORMANCE
            </div>
            <h2 className="text-[clamp(22px,2.5vw,36px)] font-bold leading-relaxed tracking-wide">
              人と企業をつなぐ、確かな技術で築いた
              <br />
              幅広い導入実績の数々。
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-black/[.06] bg-white reveal">
            {[
              { num: "120", unit: "社+", label: "導入実績" },
              { num: "93", unit: "%", label: "継続率" },
              { num: "98", unit: "%", label: "納期遵守率" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-[clamp(28px,3vw,48px)] text-center border-b sm:border-b-0 sm:border-r border-black/[.06] last:border-r-0 last:border-b-0"
              >
                <div className="font-oswald text-[clamp(36px,4vw,64px)] font-bold text-[--accent] leading-tight">
                  {stat.num}
                  <span className="text-sm text-[--text-sub]">{stat.unit}</span>
                </div>
                <div className="font-oswald text-xs text-[--text-sub] tracking-widest mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]" id="about">
        <div
          className="relative overflow-hidden min-h-[300px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="p-[clamp(40px,5vw,80px)] flex flex-col justify-center bg-white reveal">
          <div className="font-oswald text-[11px] font-semibold text-[--accent-dark] tracking-[.2em] mb-5">
            ABOUT US
          </div>
          <h2 className="text-[clamp(22px,2.2vw,32px)] font-bold leading-relaxed tracking-wide mb-5">
            「木まぐれ」に込めた想い
          </h2>
          <p className="text-sm text-[--text-sub] leading-8 mb-3">
            一人ひとりが一本の木。根を張り、幹を太くし、実を育てる。その成長が周囲や次の世代へと価値を届け、人生を自分らしく選び取る。
          </p>
          <p className="text-sm text-[--text-sub] leading-8 mb-3">
            テクノロジーは、その選択肢を広げるための道具。
            <span className="font-semibold" style={{ background: "linear-gradient(transparent 60%, rgba(221,197,39,.15) 60%)" }}>
              私たちは技術の力で、人と企業の可能性を最大化します。
            </span>
          </p>
          <p className="text-[13px] text-[--text-sub] mt-4">
            木＝人の成長　実＝成果や価値　気まぐれ＝自由に選んでいい人生
          </p>
        </div>
      </section>

      {/* INFORMATION */}
      <section className="py-[clamp(80px,10vw,160px)] px-[clamp(24px,5vw,80px)] bg-white" id="info">
        <div className="max-w-[1200px] mx-auto">
          <div className="reveal">
            <div className="font-oswald text-[11px] font-semibold text-[--text-sub] tracking-[.2em] mb-8">
              INFORMATION
            </div>
            <div className="border-t border-black/[.08]">
              {infoItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-6 py-5 border-b border-black/[.08] items-baseline flex-wrap"
                >
                  <span className="text-[13px] text-[--text-sub] whitespace-nowrap min-w-[100px]">
                    {item.date}
                  </span>
                  <span className="font-oswald text-[10px] font-bold tracking-widest bg-[--accent] text-[#111] px-2.5 py-0.5 min-w-[80px] text-center">
                    {item.tag}
                  </span>
                  <span className="text-sm text-[--text]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-[clamp(80px,10vw,160px)] px-[clamp(24px,5vw,80px)] bg-[--gray] relative overflow-hidden" id="contact">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(40px,5vw,80px)] items-center reveal">
            <div>
              <h2 className="font-oswald text-[clamp(36px,5vw,72px)] font-black tracking-wide leading-[1.2] mb-5">
                CONTACT
              </h2>
              <p className="text-sm text-[--text-sub] leading-8">
                プロジェクトのご相談、お見積もり、
                <br />
                採用に関するお問い合わせなど、
                <br />
                お気軽にご連絡ください。
              </p>
            </div>
            <div className="bg-[--accent] p-[clamp(32px,4vw,60px)] flex flex-col gap-5">
              <h3 className="text-base font-bold text-[#111] tracking-wide">
                お問い合わせ
              </h3>
              <p className="text-[13px] text-black/60 leading-[1.9]">
                下記ボタンよりお問い合わせフォームにお進みください。通常2営業日以内にご返信いたします。
              </p>
              <a
                href="mailto:info@kimagure.tech"
                className="font-oswald inline-flex items-center gap-2.5 bg-[#111] text-white px-8 py-3.5 text-[13px] font-bold tracking-wide no-underline hover:bg-[#333] transition-colors self-start"
              >
                フォームへ進む →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* RECRUIT */}
      <section
        className="relative overflow-hidden bg-cover bg-center py-[clamp(60px,8vw,120px)] px-[clamp(24px,5vw,80px)]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-[rgba(13,17,23,0.8)]" />
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center relative z-[1] reveal">
          <div>
            <h2 className="font-oswald text-[clamp(36px,5vw,72px)] font-black text-white tracking-wide leading-[1.2] mb-5">
              RECRUIT
            </h2>
            <p className="text-sm text-white/45 leading-8 mb-7">
              木まぐれでは、テクノロジーで社会に価値を届けたい仲間を募集しています。自分らしい選択を尊重し、成長を支える環境がここにあります。
            </p>
            <a
              href="#"
              className="font-oswald inline-flex items-center gap-2.5 border border-white/20 text-white px-8 py-3.5 text-[13px] font-semibold tracking-wide no-underline hover:border-[--accent] hover:text-[--accent] transition-all"
            >
              採用情報を見る →
            </a>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111] px-[clamp(24px,5vw,80px)] py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-white font-black text-sm tracking-wide">
          <span className="text-[--accent]">木</span>まぐれ
        </div>
        <div className="font-oswald text-[clamp(14px,1.5vw,20px)] font-bold text-white/[.08] tracking-[.1em]">
          テクノロジーで、この成長を加速させる。
        </div>
        <div className="text-[11px] text-white/20">
          © 2026 木まぐれ All Rights Reserved.
        </div>
      </footer>
    </>
  );
}
