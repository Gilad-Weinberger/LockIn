"use client";

import { useState, useEffect } from "react";
import GetStartedButton from "@/components/ui/GetStartedButton";
import HeroBadge from "./hero/HeroBadge";
import HeroHeadline from "./hero/HeroHeadline";
import HeroSocialProof from "./hero/HeroSocialProof";
import HeroBackground from "./hero/HeroBackground";
import { getUserCount } from "@/lib/functions/userFunctions";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualUserCount, setActualUserCount] = useState(null);
  const [isLoadingUserCount, setIsLoadingUserCount] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const count = await getUserCount();
        setActualUserCount(count);
      } catch (error) {
        console.error("Error fetching user count:", error);
        // Fall back to null on error
        setActualUserCount(null);
      } finally {
        setIsLoadingUserCount(false);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden min-h-screen sm:min-h-[80vh] md:min-h-[90vh] lg:min-h-screen">
      <HeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-screen sm:min-h-[80vh] md:min-h-[90vh] lg:min-h-screen flex items-center py-20 sm:py-12">
        <div className="text-center w-full">
          <HeroBadge isVisible={isVisible} />
          <HeroHeadline isVisible={isVisible} />

          {/* CTA Button */}
          <div
            className={`flex justify-center mb-8 sm:mb-12 transform transition-all duration-1000 delay-600 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <GetStartedButton />
          </div>
          {actualUserCount > 100 && (
            <HeroSocialProof
              isVisible={isVisible}
              actualUserCount={actualUserCount}
              isLoadingUserCount={isLoadingUserCount}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
