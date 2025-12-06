import { useState } from "react";
import {
  Code2,
  Brain,
  Users,
  Trophy,
  BookOpen,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";

function Home() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      icon: Code2,
      title: "DSA Practice",
      description:
        "Master algorithms with 500+ curated problems. Real-time code execution with Judge0 integration.",
      stats: "500+ Problems",
     
      color: "from-[var(--brand-secondary)] to-[var(--brand-primary)]",
    },
    {
      icon: Brain,
      title: "Aptitude Tests",
      description:
        "Ace quantitative & logical reasoning with adaptive difficulty and detailed explanations.",
      stats: "1000+ Questions",
      color: "from-[var(--brand-primary)] to-[#6EDBF0]",
    },
    {
      icon: Users,
      title: "Study Rooms",
      description:
        "Collaborate in real-time with peers. Share screens, discuss solutions, and learn together.",
      stats: "Live Sessions",
      color: "from-[#021B79] to-[var(--brand-secondary)]",
    },
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Learners" },
    { icon: BookOpen, value: "2000+", label: "Problems Solved Daily" },
    { icon: Trophy, value: "95%", label: "Interview Success Rate" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03c6f7c9] via-[#F5FCFF] to-[#7859dd] overflow-hidden">
      <div className="relative">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-[color-mix(in_srgb,var(--brand-primary)_20%,white)]">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Trusted by 10,000+ learners
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                Master Your
                <span className="block mt-2 bg-gradient-to-r from-[var(--brand-secondary)] via-[var(--brand-primary)] to-[#6EDBF0] bg-clip-text text-transparent">
                  Tech Interview
                </span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Your complete platform for{" "}
                <span className="font-bold text-[var(--brand-secondary)]">
                  DSA mastery
                </span>
                ,{" "}
                <span className="font-bold text-[var(--brand-primary)]">
                  aptitude excellence
                </span>{" "}
                and{" "}
                <span className="font-bold text-[#0096C7]">
                  collaborative learning
                </span>
                . Join thousands preparing for their dream tech careers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Start Learning Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-[var(--brand-secondary)] rounded-2xl font-semibold shadow-md hover:shadow-lg border-2 border-[var(--brand-primary)] hover:border-[var(--brand-secondary)] transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Join Study Room
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-[rgba(61,191,217,0.25)] shadow-sm"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-[var(--brand-primary)]" />
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 text-lg">
              Comprehensive tools designed for serious learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-[rgba(3,4,94,0.06)] overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 transform group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Stats Badge */}
                  <div className="inline-flex items-center gap-2 bg-[rgba(61,191,217,0.08)] px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-[var(--brand-secondary)]" />
                    <span className="text-sm font-semibold text-[var(--brand-secondary)]">
                      {feature.stats}
                    </span>
                  </div>

                  {/* Arrow indicator */}
                  <div className="mt-6 flex items-center text-[var(--brand-secondary)] font-semibold opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                    <span className="text-sm">Explore</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-[var(--brand-secondary)] to-[#001845] rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-[rgba(202,240,248,0.9)] text-lg mb-8">
              Join thousands of learners crushing their interview prep goals
            </p>
            <button className="px-10 py-4 bg-white text-[var(--brand-secondary)] rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border border-[var(--brand-primary)]">
              Get Started Free
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.08);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.92);
          }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Home;
