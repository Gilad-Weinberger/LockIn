"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/ui/Navbar";
import { PricingHeader, PricingGrid } from "@/components/pricing";
import { useAuth } from "@/context/AuthContext";
import { markPricingAsShown } from "@/lib/functions/userFunctions";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    if (userData) {
      markPricingAsShown(userData.id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <PricingHeader isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

          {/* Pricing Cards */}
          <PricingGrid isAnnual={isAnnual} ctaHref="/auth/signup" />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
