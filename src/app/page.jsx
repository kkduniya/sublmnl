"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { ThemedButton } from "@/components/ui/themed-button";
import SimpleAudioPlayer from "@/components/SimpleAudioPlayer";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import * as LucideIcons from "lucide-react";

// Move this function to the top, after imports and before useContent
const renderLucideIcon = (iconName, className = "w-6 h-6") => {
  if (!iconName || !LucideIcons[iconName]) return null;
  const IconComponent = LucideIcons[iconName];
  return <IconComponent className={className} />;
};

// Custom hook for fetching content
function useContent(type, options = {}) {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { limit, autoRefresh = false } = options;

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let url = `/api/admin/content?type=${type}`;
      if (limit) {
        url += `&limit=${limit}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setContent(data.content);
      } else {
        setError(data.message || "Failed to fetch content");
      }
    } catch (err) {
      setError("An error occurred while fetching content");
      console.error("Content fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchContent();
    }
  }, [type, limit]);

  return {
    content,
    isLoading,
    error,
    refetch: fetchContent,
  };
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const { currentTheme } = useTheme();

  // Refs for animations
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const howItWorksRef = useRef(null);
  const isHowItWorksInView = useInView(howItWorksRef, {
    once: true,
    amount: 0.2,
  });
  const testimonialsRef = useRef(null);
  const isTestimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.2,
  });
  const categoriesRef = useRef(null);
  const isCategoriesInView = useInView(categoriesRef, {
    once: true,
    amount: 0.2,
  });
  const manifestationRef = useRef(null);
  const isManifestationInView = useInView(manifestationRef, {
    once: true,
    amount: 0.2,
  });
  const subliminalRef = useRef(null);
  const isSubliminalInView = useInView(subliminalRef, {
    once: true,
    amount: 0.2,
  });
  const ctaRef = useRef(null);
  const isCtaInView = useInView(ctaRef, { once: true, amount: 0.2 });

  // Content hooks for dynamic data
  const { content: heroContent, isLoading: heroLoading } = useContent("hero", {
    limit: 1,
  });
  const { content: categoriesContent, isLoading: categoriesLoading } =
    useContent("categories");
  const { content: featuresContent, isLoading: featuresLoading } =
    useContent("features");
  const { content: statisticsContent, isLoading: statisticsLoading } =
    useContent("statistics");
  const { content: processContent, isLoading: processLoading } =
    useContent("process");
  const { content: contentBlocksContent, isLoading: contentBlocksLoading } =
    useContent("content-blocks");
  const { content: testimonials, isLoading: loadingTestimonials } =
    useContent("testimonials");
  const { content: sectionHeaders, isLoading: loadingSectionHeaders } =
    useContent("section-headers");
  const { content: ctaContent, isLoading: loadingCtaContent } = useContent(
    "cta-section",
    { limit: 1 }
  );

  console.log(
    contentBlocksContent,
    "contentBlocksContentcontentBlocksContentcontentBlocksContent"
  );
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get theme colors from the current theme
  const getThemeColor = (index, fallback) => {
    if (!currentTheme || !currentTheme.palettes) return fallback;
    const activePalette =
      currentTheme.palettes.find((p) => p.isActive) || currentTheme.palettes[0];
    if (
      !activePalette ||
      !activePalette.colors ||
      activePalette.colors.length <= index
    ) {
      return fallback;
    }
    return activePalette.colors[index];
  };

  // Theme colors with fallbacks
  const primaryColor = getThemeColor(0, "#4169E1"); // Primary (indigo)
  const secondaryColor = getThemeColor(1, "#87CEEB"); // Secondary (light blue)
  const accentColor = getThemeColor(2, "#1E90FF"); // Accent (dodger blue)
  const mutedColor = getThemeColor(3, "#6495ED"); // Muted (cornflower blue)

  // Get section header data
  const getSectionHeader = (sectionId) => {
    if (loadingSectionHeaders || !sectionHeaders.length) {
      return null;
    }
    const header = sectionHeaders.find((item) => {
      const data = item.parsedContent || {};
      return data.sectionId === sectionId;
    });
    return header ? header.parsedContent : null;
  };

  // Default features (fallback if no dynamic content)
  const defaultFeatures = [
    {
      title: "AI-Powered Affirmations",
      description:
        "Our advanced algorithms create personalized affirmations tailored to your specific goals and desires.",
      icon: (
        <svg
          className="w-6 h-6 "
          fill="none"
          stroke="url(#pinkGradient)"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffc2f2" />
              <stop offset="100%" stopColor="#d21e87" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: "Premium Sound Library",
      description:
        "Choose from our curated collection of ambient sounds, binaural beats, and music tracks.",
      icon: (
        <svg
          className="w-6 h-6 "
          fill="none"
          stroke="url(#pinkGradient)"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffc2f2" />
              <stop offset="100%" stopColor="#d21e87" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      ),
    },
    {
      title: "Neural Embedding Technology",
      description:
        "Our proprietary technology embeds affirmations at the perfect subliminal level for maximum effectiveness.",
      icon: (
        <svg
          className="w-6 h-6 "
          fill="none"
          stroke="url(#pinkGradient)"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffc2f2" />
              <stop offset="100%" stopColor="#d21e87" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
    {
      title: "Unlimited Downloads",
      description:
        "Download your custom tracks to listen offline anytime, anywhere, on any device.",
      icon: (
        <svg
          className="w-6 h-6 "
          fill="none"
          stroke="url(#pinkGradient)"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffc2f2" />
              <stop offset="100%" stopColor="#d21e87" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    },
  ];

  // Get dynamic hero data
  const getHeroData = () => {
    if (heroLoading || !heroContent.length) {
      return {
        badge: "Reprogram Your Mind with Sublmnl",
        title: "Music that makes your dreams come true. Literally.",
        subtitle:
          "Manifest your dream life without lifting a finger... okay, maybe just to put your headphones in.",
        buttonText: "How it Works",
        buttonLink: "#AffirmationsWork",
      };
    }
    return heroContent[0].parsedContent || {};
  };

  // Get dynamic features
  const getFeatures = () => {
    if (featuresLoading || !featuresContent.length) {
      return defaultFeatures;
    }

    return featuresContent.map((item) => {
      const data = item.parsedContent || {};
      return {
        title: data.title || item.title,
        description: data.description || "",
        icon: renderLucideIcon(
          data.icon || "Briefcase",
          "w-6 h-6",
          "url(#pinkGradient)"
        ),
      };
    });
  };

  // Get dynamic categories
  const getCategories = () => {
    if (categoriesLoading || !categoriesContent.length) {
      return [
        {
          title: "Career & Success",
          description:
            "Boost your confidence, productivity, and leadership skills.",
          icon: "M20 6h-3V4c0-1.103-.897-2-2-2H9c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zm-5-2v2H9V4h6zM8 8h12v3H4V8h4zm-4 11V13h16v6H4z",
          bgColor: "#0ef9fc",
          href: "/create?cid=career",
        },
        {
          title: "Love & Relationships",
          description:
            "Attract healthy relationships and improve existing ones.",
          icon: "M12 4.595a5.904 5.904 0 0 0-3.996-1.558 5.942 5.942 0 0 0-4.213 1.758c-2.353 2.363-2.352 6.059.002 8.412l7.332 7.332c.17.299.498.492.875.492a.99.99 0 0 0 .792-.409l7.415-7.415c2.354-2.354 2.354-6.049-.002-8.416a5.938 5.938 0 0 0-4.209-1.754A5.906 5.906 0 0 0 12 4.595zm6.791 1.61c1.563 1.571 1.564 4.025.002 5.588L12 18.586l-6.793-6.793c-1.562-1.563-1.561-4.017-.002-5.584.76-.756 1.754-1.172 2.799-1.172s2.035.416 2.789 1.17l.5.5a.999.999 0 0 0 1.414 0l.5-.5c1.512-1.509 4.074-1.505 5.584-.002z",
          bgColor: "#c3dd27",
          href: "/create?cid=relationships",
        },
        {
          title: "Health & Fitness",
          description:
            "Enhance your physical wellbeing and achieve your fitness goals.",
          icon: "M19.649 5.286 14 8.548V2.025h-4v6.523L4.351 5.286l-2 3.465 5.648 3.261-5.648 3.261 2 3.465L10 15.477V22h4v-6.523l5.649 3.261 2-3.465-5.648-3.261 5.648-3.261z",
          bgColor: "#f4bccb",
          href: "/create?cid=health",
        },
        {
          title: "Wealth & Abundance",
          description:
            "Attract financial prosperity and develop an abundance mindset.",
          icon: "M12 22c3.976 0 8-1.374 8-4V6c0-2.626-4.024-4-8-4S4 3.374 4 6v12c0 2.626 4.024 4 8 4zm0-2c-3.722 0-6-1.295-6-2v-1.268C7.541 17.57 9.777 18 12 18s4.459-.43 6-1.268V18c0 .705-2.278 2-6 2zm0-16c3.722 0 6 1.295 6 2s-2.278 2-6 2-6-1.295-6-2 2.278-2 6-2zM6 8.732C7.541 9.57 9.777 10 12 10s4.459-.43 6-1.268V10c0 .705-2.278 2-6 2s-6-1.295-6-2V8.732zm0 4C7.541 13.57 9.777 14 12 14s4.459-.43 6-1.268V14c0 .705-2.278 2-6 2s-6-1.295-6-2v-1.268z",
          bgColor: "#ba3a67",
          href: "/create?cid=wealth",
        },
      ];
    }
    return categoriesContent.map((item) => {
      const data = item.parsedContent || {};

      return {
        title: data.title || item.title,
        description: data.description || "",
        icon: data.icon || "Briefcase",
        bgColor: data.bgColor || "#0ef9fc", // Use dynamic color
        href: data.buttonLink || "/create",
      };
    });
  };

  // Get dynamic statistics
  const getStatistics = () => {
    if (statisticsLoading || !statisticsContent.length) {
      return [
        { value: "40+", label: "Songs to Choose From" },
        { value: "100%", label: "Personalized" },
        { value: "∞", label: "Tracks You Can Create" },
        { value: "24/7", label: "Support" },
      ];
    }
    return statisticsContent.map((item) => {
      const data = item.parsedContent || {};
      return {
        value: data.value || "0",
        label: data.label || item.title,
      };
    });
  };

  // Get dynamic process steps
  const getProcessSteps = () => {
    if (processLoading || !processContent.length) {
      return [
        {
          number: 1,
          title: "Define Your Goals",
          description:
            "Select from our library of affirmation categories or create your own custom affirmations tailored to your specific goals.",
          icon: (
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="url(#greenGradient)"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e4ffa8" />
                  <stop offset="100%" stopColor="#b1d239" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        },
        {
          number: 2,
          title: "Select Your Sounds",
          description:
            "Choose from a variety of voices and background sounds including ambient music, nature sounds and binaural beats.",
          icon: (
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="url(#greenGradient)"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e4ffa8" />
                  <stop offset="100%" stopColor="#b1d239" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          ),
        },
        {
          number: 3,
          title: "Download & Listen",
          description:
            "Download your custom subliminal audio track and listen for at least 20 minutes daily for optimal results.",
          icon: (
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="url(#greenGradient)"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e4ffa8" />
                  <stop offset="100%" stopColor="#b1d239" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          ),
        },
      ];
    }
    return processContent.map((item, index) => {
      const data = item.parsedContent || {};
      return {
        number: data.stepNumber || index + 1,
        title: data.title || item.title,
        description: data.description || "",
        icon: renderLucideIcon(
          data.icon || "Briefcase",
          "w-10 h-10",
          "url(#greenGradient)"
        ),
      };
    });
  };

  // Get dynamic testimonials
  const getTestimonials = () => {
    if (loadingTestimonials || !testimonials.length) {
      return [];
    }
    return testimonials.map((item) => {
      const data = item.parsedContent || {};
      return {
        _id: item._id,
        quote: data.quote || item.content,
        author: data.author || item.title,
        role: data.role || "",
        order: item.order,
      };
    });
  };

  // Get content blocks data
  const getContentBlocks = () => {
    if (contentBlocksLoading || !contentBlocksContent.length) {
      return {
        leftLayoutBlock: {
          title: "Affirmations work.",
          content:
            "And while they can be powerful, repeating statements that you know aren't true can feel disingenuous.",
          image: "/images/ThinkingGirl.png",
        },
        rightLayoutBlock: {
          title:
            "Subliminal affirmations are positive messages embedded beneath music at a volume below conscious awareness.",
          content:
            "Because you can't hear them, your conscious mind doesn't reject them – they go straight to your subconscious.",
        },
      };
    }

    let leftLayoutBlock = null;
    let rightLayoutBlock = null;

    contentBlocksContent.forEach((item) => {
      const data = item.parsedContent || {};

      const block = {
        title: data.title || item.title,
        content: data.content || "",
        image: data.image || "",
        buttonText: data.buttonText || "",
        buttonLink: data.buttonLink || "",
      };

      if (data.layout === "left" && !leftLayoutBlock) {
        leftLayoutBlock = block;
      } else if (data.layout === "right" && !rightLayoutBlock) {
        rightLayoutBlock = block;
      }
    });

    return {
      leftLayoutBlock,
      rightLayoutBlock,
    };
  };

  // Get CTA section data
  const getCtaData = () => {
    if (loadingCtaContent || !ctaContent.length) {
      return {
        title: "heje",
        subtitle:
          "Join thousands of users who are already experiencing the benefits of subliminal audio technology.",
        features: [
          {
            title: "Secure & Private",
            description:
              "Your personal information and custom affirmations are encrypted and securely stored.",
            icon: "Shield", // Capitalized to match style like "Heart"
          },
          {
            title: "24/7 Support",
            description:
              "Our dedicated support team is available around the clock to assist you with any questions.",
            icon: "Clock",
          },
        ],
      };
    }

    const content = ctaContent[0]?.parsedContent;

    return {
      title: content?.title || "",
      subtitle: content?.subtitle || "",
      features: (content?.features || []).map((feature) => ({
        title: feature.title || "",
        description: feature.description || "",
        icon: feature.icon,
      })),
      backgroundImage: content?.backgroundImage || "",
    };
  };

  const heroData = getHeroData();
  const features = getFeatures();
  const categories = getCategories();
  const statistics = getStatistics();
  const processSteps = getProcessSteps();
  const dynamicTestimonials = getTestimonials();
  const contentBlocks = getContentBlocks();
  const ctaData = getCtaData();

  // Get section headers
  const heroHeader = getSectionHeader("hero");
  const categoriesHeader = getSectionHeader("categories");
  const featuresHeader = getSectionHeader("features");
  const processHeader = getSectionHeader("process");
  const testimonialsHeader = getSectionHeader("testimonials");
  const ctaHeader = getSectionHeader("cta");
  const affirmationsWorkHeader = getSectionHeader("affirmations-work");
  const subliminalHeader = getSectionHeader("subliminal");

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div
              className={`lg:w-1/2 lg:pr-10 mb-10 lg:mb-0 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold rounded-full bg-[#1afbff]/20">
                {heroHeader?.badge || heroData.badge}
              </div>
              <h1 className="comfortaa-bold text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 bg-gradient-to-r from-[#babff9] via-[#1afbff] to-[#1afbff] text-transparent bg-clip-text animate-pulse pb-3">
                {heroHeader?.title || heroData.title}
              </h1>
              <p className="text-xl md:text-xl mb-8 text-gray-300">
                {heroHeader?.subtitle || heroData.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-out">
                <ThemedButton
                  href={heroData.buttonLink || "#AffirmationsWork"}
                  variant=""
                  className="bg-gradient-to-r from-[#babff9] via-[#1afbff] to-[#1afbff] text-gray-900 hover:font-bold "
                >
                  {heroData.buttonText}
                </ThemedButton>
              </div>
            </div>
            <div
              className={`lg:w-1/2 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-[30px] blur opacity-30 animate-pulse-slow bg-[#3bcbea]/50"></div>
                <div className="relative bg-gray-800 rounded-[30px] shadow-xl overflow-hidden border border-gray-700">
                  <div className=" h-[480px] flex items-start justify-start">
                    <Image
                      src={"/images/banner.png"}
                      alt="Logo"
                      width={120}
                      height={20}
                      className="h-full rounded-2xl shadow-lg bg-cover"
                      style={{
                        height: "auto",
                        width: "100%",
                        maxWidth: "745px",
                        maxHeight: "480px",
                        objectFit: "cover",
                        objectPosition: "97% 18%",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <SimpleAudioPlayer
                      trackTitle="Success Affirmations"
                      audioUrl="/audio/the-way-home.mp3"
                      themeColor={accentColor}
                      themeSecColor={secondaryColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-500 container mx-auto px-6 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {statistics.map((stat, index) => (
            <div key={index} className="glass-card p-6 text-center card-hover">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value === "∞" ? (
                  <div style={{ fontSize: "60px" }}>∞</div>
                ) : stat.value.includes("+") || stat.value.includes("%") ? (
                  <CountUp
                    end={parseInt(stat.value)}
                    suffix={stat.value.replace(/[0-9]/g, "")}
                    duration={5}
                  />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Affirmations Work Section */}
      <section
        id="AffirmationsWork"
        className="pb-0 relative"
        ref={manifestationRef}
      >
        <div className="max-w-7xl mx-auto p-0 container w-full relative ">
          <div className="flex flex-col md:flex-row overflow-hidden">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={
                isManifestationInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -50 }
              }
              transition={{ duration: 0.8 }}
              className="p-6 md:p-12 md:w-[43%] md:absolute top-[10%] md:left-[5%] z-[10] h-[80%] rounded-3xl bg-black/60 backdrop-blur-sm"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isManifestationInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#ffc2f2] to-[#d21e87] bg-clip-text text-transparent"
              >
                {contentBlocks.leftLayoutBlock?.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isManifestationInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-white/80 mb-3 text-lg"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: contentBlocks.leftLayoutBlock?.content,
                  }}
                />
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={
                  isManifestationInView ? { opacity: 1 } : { opacity: 0 }
                }
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative md:hidden mb-6 rounded-md"
              >
                <Image
                  src={
                    contentBlocks.leftLayoutBlock?.image ||
                    "/images/ThinkingGirl.png"
                  }
                  alt="Manifestation works"
                  width={48}
                  height={48}
                  className="w-[100%] h-[100%] object-contain object-right rounded-md"
                />
              </motion.div>
            </motion.div>
            {/* Right side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={
                isManifestationInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 50 }
              }
              transition={{ duration: 0.8 }}
              className="relative hidden md:block rounded-[30px] overflow-hidden ms-auto"
            >
              <Image
                src={"/images/ThinkingGirl.png"}
                alt="Manifestation works"
                width={48}
                height={48}
                className="w-[100%] h-[100%] object-contain object-right"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subliminal Section */}
      <section className="mt-20 mb-20 relative w-full " ref={subliminalRef}>
        <div className="max-w-7xl mx-auto container relative w-full rounded-[30px] min-h-[650px]  md:bg-[linear-gradient(to_bottom,#0f263c_50%,#1a3453_75%,#091a2b_100%)]">
          <div className="w-full">
            {/* Left side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={
                isSubliminalInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -50 }
              }
              transition={{ duration: 0.8 }}
              className="md:absolute z-10 w-full md:w-[50%] h-[320px] md:h-full md:min-h-[650px] px-6 pt-6 md:pt-0 md:px-0"
            >
              <div className="relative w-full h-full overflow-hidden rounded-md md:rounded-l-3xl md:rounded-r-none">
                <iframe
                  src="https://player.vimeo.com/video/1090773087?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;loop=1&amp;controls=0&amp;muted=1"
                  className="absolute top-0 -left-[87px] w-[calc(100%+200px)]  xl:-left-[220px]  md:w-[1160px] h-full rounded-md md:rounded-l-3xl md:rounded-r-none"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  title="Sublmnl"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </motion.div>
            {/* Right side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={
                isSubliminalInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 50 }
              }
              transition={{ duration: 0.8 }}
              className="text-gray-400 min-h-[500px] md:w-[45%] rounded-3xl ms-auto md:absolute z-10 md:right-[5%] top-[50px] bg-black/50 "
            >
              <div className="space-y-3 p-6 md:p-12 ">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isSubliminalInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-r from-[#ffc2f2] to-[#d21e87] bg-clip-text text-transparent text-2xl font-medium mb-6"
                >
                  {contentBlocks.rightLayoutBlock?.title}{" "}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isSubliminalInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-white/80 mb-6 text-lg"
                >
                  {subliminalHeader?.content ||
                    contentBlocks.subliminal?.content ||
                    "Because you can't hear them, your conscious mind doesn't reject them – they go straight to your subconscious."}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isSubliminalInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-white/80 mb-6 text-lg"
                >
                  And that's where manifestation happens.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isSubliminalInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className=""
                >
                  <blockquote className="text-white/80 text-lg font-medium rounded-xl">
                    <span className="text-white text-lg">With Sublmnl,</span>{" "}
                    you can create a custom subliminal affirmation audio track
                    tailored to your specific goals.
                  </blockquote>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isSubliminalInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-white/80 mb-6 text-lg"
                >
                  So, scroll down, type in your desires, pick your favorite
                  tune, and let the music do the heavy lifting.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isSubliminalInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <ThemedButton
                    href="/create"
                    className="w-full mt-6 md:w-auto bg-gradient-to-r from-[#ffc2f2] to-[#d21e87] text-gray-900 hover:font-bold"
                    variant=""
                  >
                    Create Your First Track
                  </ThemedButton>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 relative overflow-hidden"
        id="how-it-works"
        ref={howItWorksRef}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isHowItWorksInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[2px] shine-line"
          style={{
            background: `linear-gradient(to right, transparent, #fff, transparent)`,
          }}
        ></motion.div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                isHowItWorksInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-gradient-to-r from-[#e4ffa8]/20 to-[#b1d239]/20 "
            >
              {processHeader?.badge || "Process"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={
                isHowItWorksInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white1 mb-4 bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
            >
              {processHeader?.title || "How Sublmnl Works"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={
                isHowItWorksInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              {processHeader?.subtitle ||
                "Create your personalized subliminal audio in three simple steps"}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={
                  isHowItWorksInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 50 }
                }
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="glass-card p-8 text-center relative"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isHowItWorksInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.8, opacity: 0 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-r from-[#e4ffa8]/50 to-[#b1d239]/50"
                >
                  {step.number}
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isHowItWorksInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.8, opacity: 0 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-[#e4ffa8]/30 to-[#b1d239]/30"
                >
                  {step.icon}
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isHowItWorksInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                  className="text-xl font-semibold text-white mb-3"
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isHowItWorksInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                  className="text-gray-400"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center mt-12"
          >
            <ThemedButton
              href="/create"
              className="bg-gradient-to-r from-[#e4ffa8] to-[#b1d239]  text-gray-900 hover:font-bold"
              variant=""
            >
              Create Your First Track
            </ThemedButton>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 relative overflow-hidden" ref={categoriesRef}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isCategoriesInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[2px] shine-line"
          style={{
            background: `linear-gradient(to right, transparent, #fff, transparent)`,
          }}
        ></motion.div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, rotate: -10 }}
              animate={
                isCategoriesInView
                  ? { opacity: 1, rotate: 0 }
                  : { opacity: 0, rotate: -10 }
              }
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-gradient-to-r from-[#babff9]/20 to-[#1afbff]/20"
            >
              {categoriesHeader?.badge || "Categories"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                isCategoriesInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white1 mb-4 bg-gradient-to-r from-[#babff9] to-[#1afbff] text-transparent bg-clip-text md:w-[600px] mx-auto"
            >
              {categoriesHeader?.title || "Explore Our Audio Categories"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={
                isCategoriesInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              {categoriesHeader?.subtitle ||
                "Create your own subliminal audio track for every aspect of your life."}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 100 }}
                animate={
                  isCategoriesInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 100 }
                }
                transition={{
                  duration: 0.7,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 50,
                }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.2 },
                }}
                className="glass-card overflow-hidden rounded-2xl group flex flex-col justify-between h-full relative"
              >
                {/* Animated background with gradient overlay */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="h-40 relative overflow-hidden"
                  style={{ background: category.bgColor }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={
                      isCategoriesInView ? { opacity: 1 } : { opacity: 0 }
                    }
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"
                  />
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45 }}
                    animate={
                      isCategoriesInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0.5, rotate: -45 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15 + 0.4,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {console.log(
                      renderLucideIcon(category.icon, "w-16 h-16 text-white/40")
                    )}
                    {renderLucideIcon(category.icon, "w-16 h-16 text-white/40")}
                  </motion.div>
                </motion.div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      isCategoriesInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.5 }}
                    className="text-xl font-semibold text-white mb-2"
                  >
                    {category.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      isCategoriesInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.6 }}
                    className="text-gray-400 mb-4 flex-grow"
                  >
                    {category.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                      isCategoriesInView
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.7 }}
                  >
                    <Link
                      href={category.href}
                      className="inline-flex items-center group/link bg-gradient-to-r from-[#babff9] to-[#1afbff] text-transparent bg-clip-text"
                    >
                      Get Started
                      <motion.svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="url(#blueGradient)"
                        viewBox="0 0 24 24"
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <defs>
                          <linearGradient
                            id="blueGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#babff9" />
                            <stop offset="100%" stopColor="#1afbff" />
                          </linearGradient>
                        </defs>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </motion.svg>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden" ref={featuresRef}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[2px] shine-line"
          style={{
            background: `linear-gradient(to right, transparent, #fff, transparent)`,
          }}
        ></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-[#ffc2f2]/20"
            >
              {featuresHeader?.badge || "Features"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white1 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#ffc2f2] to-[#d21e87]"
            >
              {featuresHeader?.title ||
                "Powerful Features for Mind Transformation"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              {featuresHeader?.subtitle ||
                "Our cutting-edge platform makes it easy to create effective subliminal audio tailored to your specific goals."}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
                }
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="glass-card p-8  border border-gray-700/50"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.8, opacity: 0 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-[#ffc2f2]/30"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Width Video Section */}
      <section className="w-full py-20 relative  overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isTestimonialsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[2px] shine-line"
          style={{
            background: `linear-gradient(to right, transparent, #fff, transparent)`,
          }}
        ></motion.div>
        <div className="relative z-10 w-full max-w-none">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src="https://player.vimeo.com/video/1100595856?background=1&autoplay=1&muted=1"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              allowFullScreen
              loading="eager"
              width="640"
              height="360"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              title="AdobeStock_1439968733"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden" ref={testimonialsRef}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isTestimonialsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[2px] shine-line"
          style={{
            background: `linear-gradient(to right, transparent, #fff, transparent)`,
          }}
        ></motion.div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                isTestimonialsInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.8 }
              }
              transition={{ duration: 0.5, type: "spring" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-gradient-to-r from-[#e4ffa8]/20 to-[#b1d239]/20 "
            >
              {testimonialsHeader?.badge || "Testimonials"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={
                isTestimonialsInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white1 mb-4 bg-gradient-to-r from-[#e4ffa8] to-[#b1d239] bg-clip-text text-transparent"
            >
              {testimonialsHeader?.title || "What Our Users Say"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={
                isTestimonialsInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-white/80 max-w-3xl mx-auto"
            >
              {testimonialsHeader?.subtitle ||
                "Thousands of people have transformed their lives with Sublmnl"}
            </motion.p>
          </div>
          <div className="relative max-w-8xl mx-auto">
            {loadingTestimonials ? (
              <div className="text-center text-white/80 py-8">
                Loading testimonials...
              </div>
            ) : dynamicTestimonials.length === 0 ? (
              <div className="text-center text-white/80 py-8">
                No testimonials found.
              </div>
            ) : dynamicTestimonials.length > 3 ? (
              <div className="relative flex justify-center">
                <Carousel
                  className="w-full max-w-8xl"
                  opts={{ align: "start" }}
                >
                  <CarouselContent className="flex space-x-8">
                    {dynamicTestimonials.map((testimonial, index) => (
                      <CarouselItem
                        key={testimonial._id || index}
                        className="basis-full md:basis-1/2 lg:basis-1/3"
                      >
                        <motion.div
                          initial={{
                            opacity: 0,
                            x: index % 2 === 0 ? -50 : 50,
                          }}
                          animate={
                            isTestimonialsInView
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
                          }
                          transition={{
                            duration: 0.7,
                            delay: index * 0.2,
                            type: "spring",
                            stiffness: 50,
                          }}
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2 },
                          }}
                          className="glass-card w-[387px] h-[457px] p-8 border border-gray-700/50 flex flex-col relative overflow-hidden group"
                        >
                          {/* Animated background gradient */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={
                              isTestimonialsInView
                                ? { opacity: 0.1 }
                                : { opacity: 0 }
                            }
                            transition={{
                              duration: 1,
                              delay: index * 0.2 + 0.5,
                            }}
                            className="absolute inset-0 bg-gradient-to-br from-[#b1d239]/20 to-transparent"
                          />
                          {/* Top section: icon + quote */}
                          <div className="flex-grow relative z-10">
                            <div>
                              <svg
                                className="w-10 h-10 mb-6"
                                fill="url(#greenGradient)"
                                viewBox="0 0 24 24"
                              >
                                <defs>
                                  <linearGradient
                                    id="greenGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                  >
                                    <stop offset="0%" stopColor="#e4ffa8" />
                                    <stop offset="100%" stopColor="#b1d239" />
                                  </linearGradient>
                                </defs>
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                              </svg>
                            </div>
                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              animate={
                                isTestimonialsInView
                                  ? { opacity: 1, y: 0 }
                                  : { opacity: 0, y: 20 }
                              }
                              transition={{
                                duration: 0.5,
                                delay: index * 0.2 + 0.4,
                              }}
                              className="text-gray-300 italic"
                            >
                              {testimonial.quote}
                            </motion.p>
                          </div>
                          {/* Bottom section: author name + role */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={
                              isTestimonialsInView
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 20 }
                            }
                            transition={{
                              duration: 0.5,
                              delay: index * 0.2 + 0.6,
                            }}
                            className="mt-6 relative z-10"
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={
                                isTestimonialsInView
                                  ? { width: "100%" }
                                  : { width: 0 }
                              }
                              transition={{
                                duration: 0.5,
                                delay: index * 0.2 + 0.7,
                              }}
                              className="h-[1px] bg-gradient-to-r from-transparent via-[#ffc2f2]/50 to-transparent mb-4"
                            />
                            <p className="font-semibold text-white">
                              {testimonial.author}
                            </p>
                            <p className="text-gray-400">{testimonial.role}</p>
                          </motion.div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {dynamicTestimonials.map((testimonial, index) => (
                  <div
                    key={testimonial._id || index}
                    className="basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={
                        isTestimonialsInView
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
                      }
                      transition={{
                        duration: 0.7,
                        delay: index * 0.2,
                        type: "spring",
                        stiffness: 50,
                      }}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                      className="glass-card w-[387px] h-[457px] p-8 border border-gray-700/50 flex flex-col relative overflow-hidden group"
                    >
                      {/* Animated background gradient */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={
                          isTestimonialsInView
                            ? { opacity: 0.1 }
                            : { opacity: 0 }
                        }
                        transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                        className="absolute inset-0 bg-gradient-to-br from-[#b1d239]/20 to-transparent"
                      />
                      {/* Top section: icon + quote */}
                      <div className="flex-grow relative z-10">
                        <div>
                          <svg
                            className="w-10 h-10 mb-6"
                            fill="url(#greenGradient)"
                            viewBox="0 0 24 24"
                          >
                            <defs>
                              <linearGradient
                                id="greenGradient"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="1"
                              >
                                <stop offset="0%" stopColor="#e4ffa8" />
                                <stop offset="100%" stopColor="#b1d239" />
                              </linearGradient>
                            </defs>
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>
                        </div>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={
                            isTestimonialsInView
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 20 }
                          }
                          transition={{
                            duration: 0.5,
                            delay: index * 0.2 + 0.4,
                          }}
                          className="text-gray-300 italic"
                        >
                          {testimonial.quote}
                        </motion.p>
                      </div>
                      {/* Bottom section: author name + role */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                          isTestimonialsInView
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 20 }
                        }
                        transition={{ duration: 0.5, delay: index * 0.2 + 0.6 }}
                        className="mt-6 relative z-10"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={
                            isTestimonialsInView
                              ? { width: "100%" }
                              : { width: 0 }
                          }
                          transition={{
                            duration: 0.5,
                            delay: index * 0.2 + 0.7,
                          }}
                          className="h-[1px] bg-gradient-to-r from-transparent via-[#ffc2f2]/50 to-transparent mb-4"
                        />
                        <p className="font-semibold text-white">
                          {testimonial.author}
                        </p>
                        <p className="text-gray-400">{testimonial.role}</p>
                      </motion.div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" ref={ctaRef}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[2px]"
          style={{
            background: `linear-gradient(to right, transparent, #fff, transparent)`,
          }}
        ></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-white1 bg-gradient-to-r from-[#babff9] to-[#1afbff] text-transparent bg-clip-text md:w-[600px] mx-auto"
          >
            {ctaHeader?.title || ctaData.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-white/80 mb-8 max-w-3xl mx-auto"
          >
            {ctaHeader?.subtitle || ctaData.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {(
              ctaData.features || [
                {
                  title: "Secure & Private",
                  description:
                    "Your personal information and custom affirmations are encrypted and securely stored.",
                  icon: "shield",
                },
                {
                  title: "24/7 Support",
                  description:
                    "Our dedicated support team is available around the clock to assist you with any questions.",
                  icon: "clock",
                },
              ]
            ).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={
                  isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.1 },
                }}
                className="glass-card p-6 text-left hover:scale-105 transition-all duration-100 "
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isCtaInView
                      ? { scale: 1, opacity: 1 }
                      : { opacity: 0, scale: 0.8 }
                  }
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                  className="flex items-center mb-4"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4  transition-colors bg-gradient-to-r from-[#babff9]/30 to-[#1afbff]/30">
                    {renderLucideIcon(feature.icon, "w-5 h-5")}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                </motion.div>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
