"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PricingCheckout = ({ plan, isAnnual }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // For free plan, redirect to signup
      if (plan.name === "Starter") {
        router.push("/auth/signup");
        setIsLoading(false);
        return;
      }

      // Check if user is logged in
      const userId = user?.uid || null;
      if (!userId) {
        router.push("/auth/signin");
        setIsLoading(false);
        return;
      }

      // Get the appropriate variant ID based on billing period
      const variantId = isAnnual ? plan.annualVariantId : plan.monthlyVariantId;

      if (!variantId) {
        console.error("No valid variant ID found for plan:", plan.name);
        alert(
          "This plan is not available for checkout yet. Please contact support."
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/lemonsqueezy/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variantId: variantId,
            userId: userId,
            email: user?.email,
            redirectUrl: window.location.href,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned from API");
        }
      } catch (e) {
        console.error("Checkout API error:", e);
        alert("There was an error setting up your checkout. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 mb-6 sm:mb-8 text-sm sm:text-base text-center inline-block ${plan.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : plan.name === "Starter" ? (
        "Get Started Free"
      ) : (
        "Get Started"
      )}
    </button>
  );
};

export default PricingCheckout;
