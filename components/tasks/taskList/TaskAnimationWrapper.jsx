import { motion } from "framer-motion";

const TaskAnimationWrapper = ({ task, getAnimationValues, children }) => {
  const animationValues = getAnimationValues(task.id);

  return (
    <motion.div
      key={task.id}
      layout
      initial={animationValues.initial}
      animate={animationValues.animate}
      exit={animationValues.exit}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
      }}
    >
      {children}
    </motion.div>
  );
};

export default TaskAnimationWrapper;
