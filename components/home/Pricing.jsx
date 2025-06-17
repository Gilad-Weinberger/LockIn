"use client";

import { useState } from "react";
import PricingHeader from "../pricing/PricingHeader";
import PricingGrid from "../pricing/PricingGrid";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <PricingHeader
          title={
            <>
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                Perfect Plan
              </span>
            </>
          }
          isAnnual={isAnnual}
          setIsAnnual={setIsAnnual}
          titleTag="h2"
        />

        {/* Pricing Cards */}
        <PricingGrid isAnnual={isAnnual} />

        {/* AI Tasks Explanation */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 font-medium">
            <span className="text-red-600 font-bold">*</span> AI-Tasks means AI
            enabled for prioritization and scheduling
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
