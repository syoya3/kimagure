"use client";

import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Copy,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const consultTypes = [
  {
    id: "ai",
    label: "AI活用",
    question: "自社のどの業務からAI活用を始めるべきか相談したい",
  },
  {
    id: "development",
    label: "Web・アプリ開発",
    question: "検討しているWeb・アプリ開発を依頼できるか相談したい",
  },
  {
    id: "dx",
    label: "DX・業務改善",
    question: "現在の業務課題をどうデジタル化できるか相談したい",
  },
  {
    id: "unsure",
    label: "まだ整理できていない",
    question: "課題がまだ曖昧なので、何から整理すべきか相談したい",
  },
] as const;

const aiServices = [
  {
    name: "ChatGPT",
    description: "OpenAI",
    url: "https://chatgpt.com/",
    mark: "◎",
    color: "bg-[#10a37f]",
  },
  {
    name: "Claude",
    description: "Anthropic",
    url: "https://claude.ai/new",
    mark: "C",
    color: "bg-[#d97757]",
  },
  {
    name: "Gemini",
    description: "Google",
    url: "https://gemini.google.com/app",
    mark: "✦",
    color: "bg-[#4285f4]",
  },
] as const;

const companyContext = `
【木まぐれについて（公式サイト掲載情報）】
- Web開発・AI導入・DX支援を通じて、企業と人の可能性を最大化するIT企業
- 支援領域：企業サイト・採用サイト・業務アプリ、AI活用設計・社内実装・定着支援、DXコンサルティング、iOS / Android / Webアプリ開発
- 支援範囲：課題整理から情報設計、開発、運用まで一気通貫
- 特徴：使いやすさと成果を両立する設計、ROIを重視した施策の優先順位付け、企業の成長フェーズに合わせた提案
- サイト掲載実績：リピート相談8割、継続率93%、納期遵守率98%
`.trim();

export default function AiConsultation() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<(typeof consultTypes)[number]["id"]>("ai");
  const [detail, setDetail] = useState<string>(consultTypes[0].question);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    const pageUrl = typeof window === "undefined" ? "木まぐれ公式サイト" : window.location.origin;

    return `あなたは中立的なIT・DXアドバイザーです。以下の公式情報を根拠として、木まぐれへの相談を検討する私の判断を手伝ってください。

【相談したいこと】
${detail.trim() || "自社の課題に木まぐれの支援が合っているか知りたい"}

${companyContext}

【回答してほしいこと】
1. 私の相談に対して、木まぐれが支援できそうな範囲
2. 依頼するメリットと、事前に確認すべき点
3. 初回相談で伝えるとよい情報・質問（箇条書き）
4. 公式情報だけでは判断できない点は、推測せず「要確認」と明記

公式サイト：${pageUrl}`;
  }, [detail]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const selectType = (id: (typeof consultTypes)[number]["id"], question: string) => {
    setSelectedType(id);
    setDetail(question);
    setCopied(false);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
      return true;
    } catch {
      setCopied(false);
      return false;
    }
  };

  const openAi = (url: string) => {
    void copyPrompt();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section
        id="ai-consult"
        className="relative overflow-hidden bg-[#151711] px-[clamp(24px,5vw,80px)] py-[clamp(80px,9vw,140px)] text-white"
      >
        <div className="absolute -right-20 -top-32 h-[420px] w-[420px] rounded-full bg-[--accent]/10 blur-[90px]" />
        <div className="font-oswald pointer-events-none absolute -bottom-8 left-[-1%] whitespace-nowrap text-[clamp(70px,13vw,180px)] font-black tracking-[.08em] text-white/[.025]">
          ASK YOUR AI
        </div>

        <div className="relative z-[1] mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-[clamp(48px,7vw,100px)] lg:grid-cols-[1fr_.9fr]">
          <div className="reveal">
            <div className="font-oswald mb-5 flex items-center gap-2 text-[11px] font-semibold tracking-[.2em] text-[--accent]">
              <Sparkles size={15} aria-hidden="true" /> AI CONSULTATION
            </div>
            <h2 className="mb-6 text-[clamp(28px,3.4vw,48px)] font-black leading-[1.45] tracking-wide">
              まずは、いつものAIに
              <br />
              <span className="text-[--accent]">相談してみませんか？</span>
            </h2>
            <p className="mb-8 max-w-[560px] text-sm leading-8 text-white/55">
              木まぐれのサービス情報をまとめた相談文を、普段お使いのAIへ持ち込めます。自社の課題に合うか、依頼前に気になることを第三者目線で整理できます。
            </p>

            <div className="mb-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/60">
              {["登録不要", "約1分で相談", "入力内容は当社へ送信されません"].map((text) => (
                <span key={text} className="flex items-center gap-2">
                  <Check size={14} className="text-[--accent]" aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="group inline-flex items-center justify-center gap-3 bg-[--accent] px-8 py-4 text-sm font-bold text-[#111] transition-colors hover:bg-[--accent-dark]"
              >
                <Sparkles size={17} aria-hidden="true" />
                いつものAIに相談する
                <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              <a
                href="mailto:info@kimagure.tech?subject=プロジェクトの相談"
                className="inline-flex items-center justify-center gap-2 border border-white/15 px-7 py-4 text-sm font-semibold text-white no-underline transition-colors hover:border-white/40"
              >
                担当者に直接相談 <ChevronRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="reveal rounded-sm border border-white/10 bg-white/[.055] p-[clamp(24px,3vw,38px)] shadow-2xl shadow-black/25 backdrop-blur-sm">
            <div className="mb-7 flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[--accent] text-[#111]">
                  <Bot size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold">AIへの相談イメージ</p>
                  <p className="text-[10px] tracking-wider text-white/35">WITH OFFICIAL CONTEXT</p>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" />
            </div>

            <div className="space-y-4">
              <div className="ml-8 rounded-sm bg-white px-5 py-4 text-[13px] leading-7 text-[#333] shadow-sm">
                AI導入を検討しています。木まぐれは自社に合いそうですか？初回相談で確認すべきことも教えてください。
              </div>
              <div className="mr-8 rounded-sm border border-[--accent]/20 bg-[--accent]/[.08] px-5 py-4 text-[13px] leading-7 text-white/70">
                公式情報を見る限り、課題整理から実装・定着まで一気通貫で相談したい企業と相性がよさそうです。まずは対象業務、現在の運用、期待する成果を整理すると…
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[--accent]">
                  <ShieldCheck size={13} aria-hidden="true" /> 公式サイトの情報を参照
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full bg-[#111] py-3 pl-4 pr-5 text-xs font-bold text-white shadow-[0_10px_35px_rgba(0,0,0,.28)] transition-all hover:-translate-y-0.5 hover:bg-[#242424] sm:bottom-7 sm:right-7 sm:text-sm"
        aria-label="AIに相談する"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[--accent] text-[#111]">
          <MessageCircle size={17} aria-hidden="true" />
        </span>
        AIに相談
      </button>

      {isOpen && (
        <div
          className="ai-modal-backdrop fixed inset-0 z-[200] flex items-end justify-center bg-black/65 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <section
            className="ai-modal-panel relative max-h-[94dvh] w-full max-w-[760px] overflow-y-auto rounded-t-2xl bg-[#fbfaf5] text-[#222] shadow-2xl sm:rounded-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-consult-title"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/[.05] text-[#333] transition-colors hover:bg-black/10"
              aria-label="閉じる"
            >
              <X size={19} aria-hidden="true" />
            </button>

            <div className="border-b border-black/[.07] px-6 pb-6 pt-8 sm:px-10 sm:pt-9">
              <div className="font-oswald mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-[.2em] text-[--accent-dark]">
                <Sparkles size={14} aria-hidden="true" /> ASK YOUR AI
              </div>
              <h2 id="ai-consult-title" className="pr-12 text-[clamp(22px,3vw,30px)] font-black leading-snug">
                木まぐれについて、AIに相談する
              </h2>
              <p className="mt-2 text-xs leading-6 text-[--text-sub]">
                公式情報を含む相談文をつくり、普段お使いのAIへ持ち込めます。
              </p>
            </div>

            <div className="space-y-7 px-6 py-7 sm:px-10 sm:py-8">
              <fieldset>
                <legend className="mb-3 text-xs font-bold">
                  <span className="font-oswald mr-2 text-[--accent-dark]">01</span>
                  近い相談テーマを選んでください
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {consultTypes.map((type) => {
                    const active = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => selectType(type.id, type.question)}
                        className={`min-h-[48px] border px-3 py-2.5 text-left text-[11px] font-semibold leading-5 transition-colors sm:text-xs ${
                          active
                            ? "border-[--accent-dark] bg-[--accent]/15 text-[#222]"
                            : "border-black/10 bg-white text-[--text-sub] hover:border-black/25"
                        }`}
                        aria-pressed={active}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label htmlFor="ai-consult-detail" className="mb-3 block text-xs font-bold">
                  <span className="font-oswald mr-2 text-[--accent-dark]">02</span>
                  相談内容を編集できます
                </label>
                <textarea
                  id="ai-consult-detail"
                  value={detail}
                  onChange={(event) => {
                    setDetail(event.target.value);
                    setCopied(false);
                  }}
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none border border-black/10 bg-white p-4 text-sm leading-7 outline-none transition-colors placeholder:text-black/25 focus:border-[--accent-dark]"
                  placeholder="例：社内の問い合わせ対応をAIで効率化したい"
                />
                <div className="mt-1 text-right font-oswald text-[10px] text-black/30">
                  {detail.length} / 500
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <p className="text-xs font-bold">
                    <span className="font-oswald mr-2 text-[--accent-dark]">03</span>
                    使いたいAIを選んでください
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyPrompt()}
                    className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-[--text-sub] transition-colors hover:text-[#222]"
                  >
                    {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                    {copied ? "コピーしました" : "相談文だけコピー"}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {aiServices.map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => openAi(service.url)}
                      className="group flex items-center gap-3 border border-black/10 bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-black/25 hover:shadow-md"
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${service.color} text-sm font-bold text-white`}>
                        {service.mark}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold">{service.name}</span>
                        <span className="block text-[9px] text-black/35">コピーして開く</span>
                      </span>
                      <ArrowUpRight size={14} className="ml-auto shrink-0 text-black/25 transition-colors group-hover:text-black/60" aria-hidden="true" />
                    </button>
                  ))}
                </div>

                <p className="mt-3 flex items-start gap-2 text-[10px] leading-5 text-black/40">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[--accent-dark]" aria-hidden="true" />
                  相談文をクリップボードにコピーしてAIを開きます。開いた画面で貼り付けて送信してください。入力内容は木まぐれには送信されません。
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-black/[.07] pt-5">
                <p className="text-[10px] leading-5 text-black/40">
                  AIの回答は参考情報です。最終的なご相談は担当者が承ります。
                </p>
                <a
                  href="mailto:info@kimagure.tech?subject=AI相談からのお問い合わせ"
                  className="shrink-0 text-[11px] font-bold text-[#222] underline decoration-[--accent-dark] decoration-2 underline-offset-4"
                >
                  担当者に相談
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
