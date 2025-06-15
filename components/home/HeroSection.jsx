"use client";

import { useState, useEffect } from "react";
import GetStartedButton from "@/components/ui/GetStartedButton";
import HeroBadge from "./HeroBadge";
import HeroHeadline from "./HeroHeadline";
import HeroSocialProof from "./HeroSocialProof";
import HeroBackground from "./HeroBackground";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-center w-full">
          <HeroBadge isVisible={isVisible} />
          <HeroHeadline isVisible={isVisible} />

          {/* CTA Button */}
          <div
            className={`flex justify-center mb-12 transform transition-all duration-1000 delay-600 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <GetStartedButton />
          </div>

          <HeroSocialProof isVisible={isVisible} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
