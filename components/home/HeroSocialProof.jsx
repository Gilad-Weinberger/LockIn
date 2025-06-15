import Image from "next/image";
import { statsData } from "@/lib/homepage-data";

const HeroSocialProof = ({ isVisible }) => {
  const happyUsersData = statsData.find((stat) => stat.label === "Happy Users");

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
          Loved by over {happyUsersData?.value || "2,500+"} people worldwide
        </span>
      </div>
    </div>
  );
};

export default HeroSocialProof;
