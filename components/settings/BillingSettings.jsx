"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserSubscriptionLevel,
  getUserBillingCycle,
  hasPaymentAccess,
} from "@/lib/utils/subscription-utils";

// Import the new components
import LoadingState from "./billing/LoadingState";
import CurrentPlan from "./billing/CurrentPlan";
import UpgradePrompt from "./billing/UpgradePrompt";
import SubscriptionActive from "./billing/SubscriptionActive";
import BillingPortalInfo from "./billing/BillingPortalInfo";

const BillingSettings = () => {
  const { user, userData } = useAuth();
  const [subscriptionLevel, setSubscriptionLevel] = useState(null);
  const [billingCycle, setBillingCycle] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const [level, cycle, access] = await Promise.all([
          getUserSubscriptionLevel(user.uid),
          getUserBillingCycle(user.uid),
          hasPaymentAccess(user.uid),
        ]);

        setSubscriptionLevel(level);
        setBillingCycle(cycle);
        setHasAccess(access);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user?.uid, userData]);

  const handleManageBilling = async () => {
    if (!user?.uid) return;

    setPortalLoading(true);
    try {
      const response = await fetch("/api/lemonsqueezy/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error(data.error || "Failed to create billing portal");
      }
    } catch (error) {
      console.error("Error creating billing portal:", error);
      alert(
        error.message || "Failed to open billing portal. Please try again."
      );
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Billing & Subscription
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <CurrentPlan
        subscriptionLevel={subscriptionLevel}
        billingCycle={billingCycle}
        hasAccess={hasAccess}
        onManageBilling={handleManageBilling}
        portalLoading={portalLoading}
      />

      {/* Upgrade/Manage Section */}
      {!hasAccess ? <UpgradePrompt /> : <SubscriptionActive />}

      {/* Billing Portal Information */}
      {hasAccess && <BillingPortalInfo />}
    </div>
  );
};

export default BillingSettings;
