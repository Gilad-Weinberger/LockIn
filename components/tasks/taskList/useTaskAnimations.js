import { useState } from "react";

export const useTaskAnimations = () => {
  const [taskAnimationDirections, setTaskAnimationDirections] = useState({});

  // Helper function to get animation values based on direction
  const getAnimationValues = (taskId) => {
    const direction = taskAnimationDirections[taskId];

    if (direction === "from-left") {
      return {
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 40 },
      };
    } else if (direction === "from-right") {
      return {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
      };
    }

    // Default animation (for new tasks or normal renders)
    return {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -40 },
    };
  };

  return {
    taskAnimationDirections,
    setTaskAnimationDirections,
    getAnimationValues,
  };
};
