"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/ui/Navbar";
import { PricingHeader, PricingGrid } from "@/components/pricing";
import { useAuth } from "@/context/AuthContext";
import { markPricingAsShown } from "@/lib/functions/userFunctions";
import { useRouter } from "next/navigation";
import { hasPaymentAccess } from "@/lib/utils/subscription-utils";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAccessAndMarkPricing = async () => {
      if (!userData) return;

      // If the user already has access, redirect them away from the pricing page
      const accessGranted = await hasPaymentAccess(userData.id);
      if (accessGranted) {
        router.replace("/tasks");
        return;
      }

      // Otherwise, mark that the pricing page has been shown
      await markPricingAsShown(userData.id);
    };

    checkAccessAndMarkPricing();
  }, [userData, router]);

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
