import { pricingPlans } from "@/lib/homepage-data";
import PricingCard from "./PricingCard";

const PricingGrid = ({ isAnnual, ctaHref = "/auth/signup" }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {pricingPlans.map((plan, index) => (
        <PricingCard
          key={index}
          plan={plan}
          isAnnual={isAnnual}
          ctaHref={ctaHref}
        />
      ))}
    </div>
  );
};

export default PricingGrid; 