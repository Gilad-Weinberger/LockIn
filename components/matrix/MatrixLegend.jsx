"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAIPrioritizationTokensLeft } from "@/lib/plans/freePlanFeatures";
import { getUserSubscriptionLevel } from "@/lib/utils/subscription-utils";
import AIFunctionButton from "@/components/ui/AIFunctionButton";

const MatrixLegend = ({ onRePrioritize, isPrioritizing = false }) => {
  const { user } = useAuth();
  const [tokensLeft, setTokensLeft] = useState(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!user) return;

      try {
        const level = await getUserSubscriptionLevel(user.uid);
        setSubscriptionLevel(level);

        if (level === "free") {
          const tokens = await getAIPrioritizationTokensLeft(user.uid);
          setTokensLeft(tokens);
        }
      } catch (error) {
        console.error("Error fetching token info:", error);
      }
    };

    fetchTokenInfo();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-[18px] py-5 border flex-shrink-0">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">
        Eisenhower Matrix
      </h3>

      <div className="space-y-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-red-200 border border-red-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">DO</div>
            <div className="text-gray-600">Important & Urgent</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-yellow-200 border border-yellow-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">PLAN</div>
            <div className="text-gray-600">Important & Not Urgent</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-200 border border-blue-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">DELEGATE</div>
            <div className="text-gray-600">Not Important & Urgent</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded flex-shrink-0"></div>
          <div>
            <div className="font-semibold">DELETE</div>
            <div className="text-gray-600">Not Important & Not Urgent</div>
          </div>
        </div>
      </div>

      {/* AI Prioritize Button */}
      {onRePrioritize && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <AIFunctionButton
            onClick={onRePrioritize}
            disabled={subscriptionLevel === "free" && tokensLeft === 0}
            isProcessing={isPrioritizing}
            processingText="AI prioritizing..."
            size="sm"
            className="w-full"
          >
            AI prioritize
          </AIFunctionButton>
          {subscriptionLevel === "free" && tokensLeft === 0 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Upgrade to Pro for unlimited AI prioritizations
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MatrixLegend;
