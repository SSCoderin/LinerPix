"use client";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Upload,
  Eye,
  Image,
  Brain,
  Zap,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: Upload,
      title: "Upload",
      description: "User uploads a paragraph, story, or article.",
      color: "bg-blue-600",
    },
    {
      icon: Eye,
      title: "Read",
      description:
        "Eye and voice tracking monitor how the user reads the content.",
      color: "bg-emerald-600",
    },
    {
      icon: Image,
      title: "Visualize",
      description:
        "As the user reads, relevant AI-generated images appear line-by-line.",
      color: "bg-violet-600",
    },
    {
      icon: Brain,
      title: "Understand",
      description: "Concepts become easier to grasp with visual context.",
      color: "bg-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="relative bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PicTales</h1>
                <p className="text-sm text-gray-600">
                  Line to Line Pixel Generation
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#demo"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Demo
              </a>
              <button
                onClick={() => (window.location.href = "/content")}
                className="bg-gradient-to-r cursor-pointer from-blue-600 to-violet-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Get Started
              </button>
            </nav>

            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  How It Works
                </a>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Features
                </a>
                <a
                  href="#demo"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Demo
                </a>
                <button
                  onClick={() => (window.location.href = "/content")}
                  className="bg-gradient-to-r cursor-pointer from-blue-600 to-violet-600 text-white px-6 py-2 rounded-lg w-full font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/40 to-violet-100/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Turn Your Story into
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  {" "}
                  Stunning Visuals
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium">
                As You Read
              </p>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Upload any text – story, article, or paragraph – and watch as
                meaningful images appear in sync with your reading. Powered by
                AI and real-time eye/voice tracking.
              </p>
            </div>

            <div
              className={`transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => (window.location.href = "/content")}
                  className="group bg-gradient-to-r cursor-pointer from-blue-600 to-violet-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-violet-700 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the magic of real-time visualization in four simple
              steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;

              return (
                <div
                  key={index}
                  className={`relative p-8 rounded-2xl border-2 transition-all duration-500 bg-white ${
                    isActive
                      ? "border-blue-300 shadow-2xl scale-105"
                      : "border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 shadow-lg ${
                      isActive ? step.color : "bg-gray-400"
                    }`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {index + 1}. {step.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 -z-10"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to transform reading into an immersive visual
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-time Eye Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced eye tracking technology monitors your reading pace and
                generates visuals that sync perfectly with your comprehension.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI-Powered Visualization
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent AI understands context and generates relevant,
                meaningful images that enhance your understanding of the text.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-violet-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Experience seamless, real-time image generation with zero lag,
                ensuring your reading flow is never interrupted.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Reading?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join us on this exciting journey and experience the future of
            interactive reading with PicTales.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => (window.location.href = "/content")}
              className="group bg-white text-blue-600 px-8 cursor-pointer py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <span>Get Started</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-xl text-lg font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-900 font-bold text-lg">PicTales</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 PicTales. Visualizing your thoughts, one line at a time.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
