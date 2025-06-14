"use client";

import { useRouter } from "next/navigation";

const NavigationButton = ({
  direction = "left",
  destination,
  position = "left",
  className = "",
  ariaLabel,
  children,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (destination) {
      router.push(destination);
    } else {
      router.back();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "fixed left-8 top-1/2 -translate-y-1/2";
      case "right":
        return "fixed right-8 top-1/2 -translate-y-1/2";
      default:
        return "fixed left-8 top-1/2 -translate-y-1/2";
    }
  };

  const getDirectionIcon = () => {
    switch (direction) {
      case "left":
        return "<";
      case "right":
        return ">";
      default:
        return "<";
    }
  };

  const defaultAriaLabel = destination
    ? `Navigate to ${destination.replace("/", "")}`
    : "Go back";

  return (
    <button
      className={`${getPositionClasses()} z-40 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition focus:outline-none cursor-pointer ${className}`}
      aria-label={ariaLabel || defaultAriaLabel}
      onClick={handleClick}
    >
      {children ? (
        children
      ) : (
        <span className="text-2xl font-bold">{getDirectionIcon()}</span>
      )}
    </button>
  );
};

export default NavigationButton;
