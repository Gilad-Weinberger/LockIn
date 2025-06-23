import CalendarTaskItem from "./CalendarTaskItem";
import CalendarEmptyState from "./CalendarEmptyState";

const CalendarTaskList = ({
  dayTasks,
  categories,
  onEditTask,
  onTaskDeleted,
}) => {
  if (dayTasks.length === 0) {
    return <CalendarEmptyState />;
  }

  return (
    <div className="space-y-3">
      {dayTasks.map((task) => (
        <CalendarTaskItem
          key={task.id}
          task={task}
          categories={categories}
          onEditTask={onEditTask}
          onTaskDeleted={onTaskDeleted}
        />
      ))}
    </div>
  );
};

export default CalendarTaskList;
