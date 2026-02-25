'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, Rocket, Users, ExternalLink, Menu, X, MessageCircle, Code } from 'lucide-react';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "学びの場づくり",
      who: "スキルを伸ばしたい方へ",
      description: "実践型ワークショップやオンライン学習で、あなたの「気になる」を知識と行動に変えます。"
    },
    {
      icon: <Rocket className="w-12 h-12" />,
      title: "挑戦の機会づくり",
      who: "一歩踏み出したい方へ",
      description: "小さな挑戦を積み重ねられる環境と伴走サポートで、アイデアを形にするまでを支えます。"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "つながりの循環設計",
      who: "地域・コミュニティを育てたい方へ",
      description: "デジタルとリアルを組み合わせ、人と地域が成長し合える仕組みを一緒につくります。"
    },
  ];

  const philosophyItems = [
    { term: '木', meaning: '人の成長' },
    { term: '実', meaning: '成果と価値' },
    { term: '気まぐれ', meaning: '自分らしい自由な選択' },
    { term: '次世代', meaning: '価値の循環' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2f2a25] via-[#3a332b] to-[#2f2a25]">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-lime-400 bg-clip-text text-transparent">
                木まぐれ
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-white hover:text-amber-300 transition-colors">ホーム</a>
              <a href="#services" className="text-white hover:text-amber-300 transition-colors">事業内容</a>
              <a href="#contact" className="text-white hover:text-amber-300 transition-colors">お問い合わせ</a>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-900/95 backdrop-blur-md rounded-lg mt-2 p-4">
              <nav className="flex flex-col space-y-4">
                <a href="#home" className="text-white hover:text-amber-300 transition-colors">ホーム</a>
                <a href="#services" className="text-white hover:text-amber-300 transition-colors">事業内容</a>
                <a href="#contact" className="text-white hover:text-amber-300 transition-colors">お問い合わせ</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-lime-500/20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-400 bg-clip-text text-transparent">
              木まぐれ
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            人が根を伸ばし、未来へ価値を実らせる。<br />
            学び・挑戦・つながりの場をつくる会社です。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a
              href="#services"
              className="px-8 py-3 bg-gradient-to-r from-amber-400 to-lime-500 text-slate-900 font-bold rounded-full hover:opacity-90 transition"
            >
              事業を見る
            </a>
            <a
              href="#contact"
              className="px-8 py-3 border border-amber-300 text-amber-200 font-semibold rounded-full hover:bg-amber-300/10 transition"
            >
              無料で相談する
            </a>
          </div>

          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-lime-400 bg-clip-text text-transparent">
              木まぐれとは（30秒でわかる）
            </h2>
            <p className="text-gray-300">会社名に込めた想いを、4つの言葉で表現しています。</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {philosophyItems.map((item) => (
              <div key={item.term} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-center">
                <p className="text-amber-300 text-2xl font-bold mb-2">{item.term}</p>
                <p className="text-gray-200">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-lime-400 bg-clip-text text-transparent">
              あなたの一歩を応援する3つの事業
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              「気になる」を行動に変え、成長の循環を生む場と仕組みを提供します
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 hover:border-amber-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/10 hover:transform hover:scale-105"
              >
                <div className="text-amber-400 mb-4 group-hover:text-lime-400 transition-colors duration-300">
                  {service.icon}
                </div>
                <p className="text-sm text-amber-300/80 font-medium mb-2">{service.who}</p>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-amber-300 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="#contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-amber-400 to-lime-500 text-slate-900 font-bold rounded-full hover:opacity-90 transition"
            >
              まずは無料で相談する
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-lime-400 bg-clip-text text-transparent">
                木まぐれの想い
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                人が集い、学び、挑戦できる場と仕組みをつくり、価値の芽が育つ環境を育てます。個人の成長が、周囲や地域、次世代へと循環していくことを目指しています。
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                自分らしい選択を尊重しながら、小さな挑戦を積み重ねる。木まぐれは、デジタルとコミュニティの力で、長く根づく価値づくりに伴走します。
              </p>
              <div className="flex items-center text-amber-300">
                <ExternalLink className="w-5 h-5 mr-2" />
                <span className="font-semibold">kimagure.tech</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-amber-400/20 to-lime-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-lime-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Code className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Innovation</h3>
                  <p className="text-gray-300">革新的な技術で未来を創造</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-300 to-lime-400 bg-clip-text text-transparent">
            まずは気軽に話してみませんか？
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            「こんなこと相談していいのかな？」で大丈夫です。<br />
            あなたの「気になる」から、一緒に考えます。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="mailto:contact@kimagure.tech"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-lime-500 text-slate-900 font-bold rounded-full hover:opacity-90 transition text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              無料で相談する
            </a>
            <a
              href="https://lin.ee/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 border-2 border-green-400 text-green-300 font-semibold rounded-full hover:bg-green-400/10 transition text-lg"
            >
              LINEで相談する
            </a>
          </div>

          <p className="text-gray-500 text-sm">
            ※ 相談は無料です。お気軽にご連絡ください。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-lime-400 bg-clip-text text-transparent mb-4">
            木まぐれ 〜気になる木〜
          </h2>
          <p className="text-gray-400 mb-4">
            人が根を伸ばし、自分らしく枝を広げ、未来へ価値を実らせる。
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 木まぐれ (kimagure.tech). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}