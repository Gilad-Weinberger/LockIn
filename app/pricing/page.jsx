"use client";

import { useState } from "react";
import PricingHeader from "../../components/pricing/PricingHeader";
import PricingGrid from "../../components/pricing/PricingGrid";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <PricingHeader isAnnual={isAnnual} setIsAnnual={setIsAnnual} />

          {/* Pricing Cards */}
          <PricingGrid isAnnual={isAnnual} ctaHref="/auth/signup" />

          {/* AI Tasks Explanation */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 font-medium">
              <span className="text-red-600 font-bold">*</span> AI-Tasks means
              AI enabled for prioritization and scheduling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
