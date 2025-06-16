import Image from "next/image";
import { statsData } from "@/lib/homepage-data";
import { formatUserCount } from "@/lib/utils/userCount";

const HeroSocialProof = ({
  isVisible,
  actualUserCount,
  isLoadingUserCount,
}) => {
  const happyUsersData = statsData.find((stat) => stat.label === "Happy Users");

  // Determine what count to display
  const getDisplayCount = () => {
    if (isLoadingUserCount) {
      return happyUsersData?.value || "2,500+"; // Show static while loading
    }

    if (actualUserCount !== null && actualUserCount > 0) {
      return formatUserCount(actualUserCount);
    }

    // Fall back to static data if no actual count
    return happyUsersData?.rawValue
      ? formatUserCount(happyUsersData.rawValue)
      : happyUsersData?.value || "2,500+";
  };

  const formattedUserCount = getDisplayCount();

  return (
    <div
      className={`flex flex-col items-center space-y-4 px-4 sm:px-0 transform transition-all duration-1000 delay-800 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <div className="flex -space-x-2">
          <Image
            src="/user1.jpg"
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
          <Image
            src="/user2.jpg"
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
          <Image
            src="/user3.jpg"
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full border-2 border-white"
          />
        </div>
        <span className="text-sm sm:text-base text-gray-600 font-medium text-center">
          Loved by over {formattedUserCount} people worldwide
        </span>
      </div>
    </div>
  );
};

export default HeroSocialProof;
