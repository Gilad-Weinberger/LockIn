import { pricingPlans } from "@/lib/homepage-data";
import PricingCard from "./PricingCard";

const PricingGrid = ({ isAnnual }) => {
  return (
    <div className="flex gap-10 justify-center">
      {pricingPlans.map((plan, index) => (
        <PricingCard key={index} plan={plan} isAnnual={isAnnual} />
      ))}
    </div>
  );
};

export default PricingGrid;
