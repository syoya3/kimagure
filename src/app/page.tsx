'use client';

import Image from 'next/image';
import { Leaf, Sprout, Users, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const services = [
  {
    icon: <Sprout className="w-6 h-6" />,
    title: '学びの場づくり',
    target: '対象：成長したい個人・チーム',
    description:
      '実践型ワークショップと伴走で、知識を「できる」へ変える学びを設計します。',
    image: '/images/service-learn.svg',
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: '挑戦の機会づくり',
    target: '対象：はじめの一歩を踏み出したい人',
    description:
      '小さな挑戦を積み重ねるプロジェクト設計で、行動が続く仕組みをつくります。',
    image: '/images/service-challenge.svg',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: '地域とつながる循環づくり',
    target: '対象：地域・コミュニティ・組織',
    description:
      'デジタルとリアルを組み合わせ、人と地域が育ち合うコミュニティを育成します。',
    image: '/images/service-community.svg',
  },
];

const values = [
  '自分らしい選択を尊重する',
  '小さな挑戦を継続して育てる',
  '価値を次世代へ循環させる',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f6ef] text-[#2F2A25]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#ece6d5] bg-[#f8f6ef]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#home" className="text-xl font-bold tracking-wide">
            木まぐれ <span className="text-[#5FAF4B]">〜気になる木〜</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#concept" className="hover:text-[#5FAF4B] transition-colors">木まぐれとは</a>
            <a href="#services" className="hover:text-[#5FAF4B] transition-colors">事業内容</a>
            <a href="#about" className="hover:text-[#5FAF4B] transition-colors">理念</a>
            <a href="#contact" className="hover:text-[#5FAF4B] transition-colors">お問い合わせ</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <Image
          src="/images/hero-forest.svg"
          alt="木々と太陽をモチーフにした木まぐれのキービジュアル"
          fill
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#2F2A25]/45" />
        <div className="relative mx-auto grid min-h-[74vh] max-w-6xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="mb-4 inline-flex items-center rounded-full bg-[#F4C542]/90 px-4 py-1 text-sm font-semibold text-[#2F2A25]">
              人の成長を、地域の実りへ
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
              人が根を伸ばし、<br />
              未来へ価値を実らせる。
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-[#f8f4ea] md:text-xl">
              木まぐれは、学び・挑戦・つながりを育てる会社です。<br />
              一人ひとりの「気になる」を起点に、次世代へつながる価値の循環をつくります。
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#services"
                className="inline-flex items-center gap-2 rounded-full bg-[#F4C542] px-6 py-3 font-bold text-[#2F2A25] hover:brightness-95"
              >
                事業を見る <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20"
              >
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section id="concept" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-3 text-3xl font-bold md:text-4xl">木まぐれとは</h2>
        <p className="mb-8 text-[#5a544d]">会社名に込めた4つの意味で、私たちの姿勢を表現しています。</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['木', '人の成長'],
            ['実', '成果と価値'],
            ['気まぐれ', '自分らしい選択'],
            ['次世代', '価値の循環'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-[#ece6d5] bg-white p-5 text-center shadow-sm">
              <p className="mb-1 text-2xl font-bold text-[#5FAF4B]">{k}</p>
              <p className="text-sm text-[#5a544d]">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[#fffdf7] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">あなたの一歩を応援する3つの事業</h2>
          <p className="mb-10 text-[#5a544d]">「誰に・何を・どう変わるか」が伝わるサービス設計で伴走します。</p>

          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="overflow-hidden rounded-2xl border border-[#ece6d5] bg-white shadow-sm">
                <div className="relative h-44 w-full">
                  <Image src={service.image} alt={service.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f3f9ef] px-3 py-1 text-sm text-[#3f7f35]">
                    {service.icon}
                    {service.target}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
                  <p className="text-[#5a544d]">{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="mb-5 text-3xl font-bold md:text-4xl">理念・ビジョン・ミッション</h2>
          <div className="space-y-4 text-[#5a544d]">
            <p>
              <span className="font-semibold text-[#2F2A25]">理念：</span>
              人が根を伸ばし、自分らしく枝を広げ、未来へ価値を実らせる社会をつくる。
            </p>
            <p>
              <span className="font-semibold text-[#2F2A25]">ビジョン：</span>
              自分らしい選択が尊重され、周りの人が幸せに満ち、子どもたちに明るい未来が育まれる社会をつくる。
            </p>
            <p>
              <span className="font-semibold text-[#2F2A25]">ミッション：</span>
              人が集い、学び、挑戦できる場と仕組みを創り、価値の芽が育つ環境を育てる。
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#ece6d5] bg-white p-6 shadow-sm">
          <div className="relative mb-5 h-52 w-full overflow-hidden rounded-xl">
            <Image
              src="/images/about-cycle.svg"
              alt="価値の循環を表すイメージ"
              fill
              className="object-cover"
            />
          </div>
          <h3 className="mb-3 text-xl font-bold">大切にする価値観</h3>
          <ul className="space-y-2 text-[#5a544d]">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#5FAF4B]" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[#2F2A25] py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">お問い合わせ</h2>
          <p className="mb-8 text-[#e9e1d2]">
            会社に関するお問い合わせ・ご相談は、下記メールアドレスへご連絡ください。<br />
            受信通知先：<span className="font-semibold text-[#F4C542]">info@kimagure.tech</span>
          </p>
          <a
            href="mailto:info@kimagure.tech?subject=木まぐれへのお問い合わせ"
            className="inline-flex items-center gap-2 rounded-full bg-[#F4C542] px-8 py-4 text-lg font-bold text-[#2F2A25] hover:brightness-95"
          >
            <Mail className="h-5 w-5" />
            info@kimagure.tech に問い合わせる
          </a>
        </div>
      </section>

      <footer className="border-t border-[#ece6d5] bg-[#f8f6ef] py-8 text-center text-sm text-[#6a635a]">
        <p className="font-semibold text-[#2F2A25]">木まぐれ 〜気になる木〜</p>
        <p className="mt-1">© 2026 木まぐれ (kimagure.tech) All rights reserved.</p>
      </footer>
    </div>
  );
}
