const SubscriptionActive = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Subscription Active
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              Your subscription is active and you have access to all premium
              features. Use the "Manage Billing" button above to update payment
              methods, view invoices, or change your subscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionActive;
