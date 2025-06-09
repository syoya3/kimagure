'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Code, Smartphone, Brain, Blocks, ExternalLink, Menu, X } from 'lucide-react';

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
      icon: <Code className="w-12 h-12" />,
      title: "ホームページ開発",
      description: "モダンで高性能なWebサイトを構築します。レスポンシブデザインでどのデバイスでも美しく表示されます。"
    },
    {
      icon: <Smartphone className="w-12 h-12" />,
      title: "アプリ開発",
      description: "iOS・Android対応のモバイルアプリケーションから、Web アプリケーションまで幅広く対応いたします。"
    },
    {
      icon: <Brain className="w-12 h-12" />,
      title: "AI開発",
      description: "機械学習・深層学習を活用したAIソリューションで、ビジネスの自動化と効率化を実現します。"
    },
    {
      icon: <Blocks className="w-12 h-12" />,
      title: "ブロックチェーン開発",
      description: "分散型アプリケーション（DApps）やスマートコントラクトの開発で、革新的なソリューションを提供します。"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                木まぐれ
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-white hover:text-cyan-400 transition-colors">Home</a>
              <a href="#services" className="text-white hover:text-cyan-400 transition-colors">Services</a>
              <a href="#contact" className="text-white hover:text-cyan-400 transition-colors">Contact</a>
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
                <a href="#home" className="text-white hover:text-cyan-400 transition-colors">Home</a>
                <a href="#services" className="text-white hover:text-cyan-400 transition-colors">Services</a>
                <a href="#contact" className="text-white hover:text-cyan-400 transition-colors">Contact</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              木まぐれ
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            革新的なITソリューションで<br />
            あなたのビジネスを次のレベルへ
          </p>

          <div className="absolute bottom-[-32] left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Our Services
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              テクノロジーの力で、お客様のビジネス課題を解決し、新たな可能性を創造します
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:bg-slate-700/50 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/10 hover:transform hover:scale-105"
              >
                <div className="text-cyan-400 mb-6 group-hover:text-purple-400 transition-colors duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                About 木まぐれ
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                私たちは最新のテクノロジーを駆使して、お客様のデジタル変革をサポートいたします。ホームページ開発からAI・ブロックチェーン開発まで、幅広い技術領域で高品質なソリューションを提供しています。
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                常に新しい技術にチャレンジし、お客様のビジネス成長に貢献することを使命として、革新的なサービスをお届けします。
              </p>
              <div className="flex items-center text-cyan-400">
                <ExternalLink className="w-5 h-5 mr-2" />
                <span className="font-semibold">kimagure.tech</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mb-6 mx-auto">
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
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            プロジェクトについてのご相談や、サービスに関するお問い合わせはお気軽にどうぞ
          </p>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Website</h3>
                <p className="text-cyan-400 font-semibold">kimagure.tech</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Services</h3>
                <p className="text-gray-300">Web・Mobile・AI・Blockchain</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
                <p className="text-gray-300">最新技術でソリューション提供</p>
              </div>
            </div>
          </div>

          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 text-lg">
            お問い合わせはこちら
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            木まぐれ
          </h2>
          <p className="text-gray-400 mb-4">
            革新的なITソリューションで未来を創造
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 木まぐれ (kimagure.tech). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}