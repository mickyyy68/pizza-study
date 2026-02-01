import {
  Add01Icon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BookOpen01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Badge,
  Button,
  cn,
  EmptyState,
  Input,
  SlideOver,
  SlideOverContent,
  SlideOverFooter,
  SlideOverHeader,
} from "@repo/ui";
import { format, isSameDay, isSameMonth, isToday } from "date-fns";
import { useEffect, useState } from "react";
import { formatDate, useCalendarStore } from "../../stores/calendar-store";
import type { Task } from "../../types";

/**
 * CalendarPage - Day-focused planning for Pizza Study.
 *
 * Features:
 * - Month grid view
 * - Day selection
 * - Task list for selected day
 * - Event indicators
 */
export function CalendarPage() {
  const {
    tasks,
    events,
    currentMonth,
    selectedDate,
    navigateMonth,
    goToToday,
    getCalendarDays,
    addTask,
    error,
    clearError,
    fetchTasks,
    fetchEvents,
  } = useCalendarStore();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const days = getCalendarDays();
  // Filter tasks/events for selected date - subscribing to tasks/events ensures re-renders
  const selectedTasks = tasks.filter((task) =>
    isSameDay(task.dueDate, selectedDate),
  );
  const selectedEvents = events.filter((event) =>
    isSameDay(event.date, selectedDate),
  );

  const handleRetry = () => {
    clearError();
    fetchTasks();
    fetchEvents();
  };

  return (
    <div className="flex h-full">
      {/* Error Banner */}
      {error && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-destructive/10 border-b border-destructive/20 p-3 flex items-center justify-between">
          <p className="text-sm text-destructive flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} />
            {error}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold">
              {formatDate(currentMonth, "MMMM yyyy")}
            </h1>
            <p className="text-sm text-muted-foreground">
              Plan your study sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth("prev")}
                aria-label="Previous month"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth("next")}
                aria-label="Next month"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Button>
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 flex-1">
            {days.map((day) => (
              <DayCell key={day.toISOString()} date={day} />
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel - Selected Day Details */}
      <aside className="w-80 border-l border-border bg-muted/30 p-4 overflow-auto hidden lg:block">
        <div className="mb-6">
          <h2 className="font-serif text-lg font-semibold">
            {formatDate(selectedDate, "EEEE")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>

        {/* Tasks Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              Tasks
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} size={12} className="mr-1" />
              Add
            </Button>
          </div>

          {selectedTasks.length === 0 ? (
            <EmptyState
              icon={<HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />}
              title="No tasks"
              description="Add a task to plan your day"
              size="sm"
            />
          ) : (
            <ul className="space-y-2">
              {selectedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          )}
        </section>

        {/* Events Section */}
        <section>
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <HugeiconsIcon icon={Clock01Icon} size={16} />
            Events
          </h3>

          {selectedEvents.length === 0 ? (
            <EmptyState
              icon={<HugeiconsIcon icon={Clock01Icon} size={20} />}
              title="No events"
              description="Nothing scheduled for this day"
              size="sm"
            />
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </ul>
          )}
        </section>
      </aside>

      {/* Add Task SlideOver */}
      <AddTaskSlideOver
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        defaultDate={selectedDate}
        onAddTask={addTask}
      />
    </div>
  );
}

/**
 * Day cell component for calendar grid.
 */
function DayCell({ date }: { date: Date }) {
  const { tasks, events, currentMonth, selectedDate, setSelectedDate } =
    useCalendarStore();

  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isSelected = isSameDay(date, selectedDate);
  const isTodayDate = isToday(date);

  // Filter tasks/events for this specific date
  const dayTasks = tasks.filter((task) => isSameDay(task.dueDate, date));
  const dayEvents = events.filter((event) => isSameDay(event.date, date));
  const hasItems = dayTasks.length > 0 || dayEvents.length > 0;

  return (
    <button
      type="button"
      onClick={() => setSelectedDate(date)}
      className={cn(
        "relative p-2 rounded-lg text-sm transition-all duration-150",
        "hover:bg-accent/50",
        !isCurrentMonth && "text-muted-foreground/40",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary",
        isTodayDate &&
          !isSelected &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <span className="font-medium">{format(date, "d")}</span>

      {/* Event/task indicators */}
      {hasItems && !isSelected && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {dayTasks.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
          {dayEvents.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </div>
      )}
    </button>
  );
}

/**
 * Task item component for side panel.
 */
function TaskItem({
  task,
}: {
  task: ReturnType<typeof useCalendarStore.getState>["tasks"][0];
}) {
  const { toggleTaskComplete } = useCalendarStore();

  const priorityStyles = {
    high: "border-l-destructive",
    medium: "border-l-accent",
    low: "border-l-muted-foreground/30",
  };

  const handleToggle = () => {
    toggleTaskComplete(task.id);
  };

  return (
    <li
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border bg-card border-l-4",
        priorityStyles[task.priority],
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center",
          "border-border bg-background cursor-pointer",
          "hover:border-primary/50 transition-all duration-150",
          task.completed && "bg-primary border-primary",
        )}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg
            aria-hidden="true"
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            task.completed && "line-through text-muted-foreground",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * Event item component for side panel.
 */
function EventItem({
  event,
}: {
  event: ReturnType<typeof useCalendarStore.getState>["events"][0];
}) {
  const typeIcons: Record<string, IconSvgElement> = {
    "study-session": BookOpen01Icon,
    exam: AlertCircleIcon,
    deadline: Clock01Icon,
    review: CheckmarkCircle02Icon,
  };

  const typeColors = {
    "study-session": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    exam: "bg-destructive/10 text-destructive",
    deadline: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    review: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  const icon = typeIcons[event.type];

  return (
    <li className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          typeColors[event.type],
        )}
      >
        <HugeiconsIcon icon={icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{event.title}</p>
        {event.startTime && (
          <p className="text-xs text-muted-foreground">
            {event.startTime}
            {event.endTime && ` - ${event.endTime}`}
          </p>
        )}
      </div>
      <Badge variant="muted" size="sm">
        {event.type.replace("-", " ")}
      </Badge>
    </li>
  );
}

/**
 * AddTaskSlideOver - Form to create new tasks.
 */
function AddTaskSlideOver({
  open,
  onClose,
  defaultDate,
  onAddTask,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
  onAddTask: (
    task: Omit<Task, "id" | "completed" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [error, setError] = useState("");

  // Reset form when opening and set default date
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setDueDate(format(defaultDate, "yyyy-MM-dd"));
      setPriority("medium");
      setError("");
      // Focus title input after a brief delay for animation
      setTimeout(() => {
        document.getElementById("task-title")?.focus();
      }, 100);
    }
  }, [open, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      document.getElementById("task-title")?.focus();
      return;
    }

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate),
      priority,
      tags: [],
    });

    onClose();
  };

  const priorityOptions: { value: Task["priority"]; label: string }[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <SlideOver open={open} onClose={onClose} side="right" size="md">
      <SlideOverHeader onClose={onClose}>Add Task</SlideOverHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <SlideOverContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter task title"
              className={cn(
                error && "border-destructive focus:border-destructive",
              )}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label htmlFor="task-due-date" className="text-sm font-medium">
              Due Date
            </label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Priority */}
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Priority</legend>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={priority === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority(option.value)}
                  className={cn(
                    "flex-1",
                    priority === option.value &&
                      option.value === "high" &&
                      "bg-destructive hover:bg-destructive/90",
                    priority === option.value &&
                      option.value === "medium" &&
                      "bg-accent text-accent-foreground hover:bg-accent/90",
                    priority === option.value &&
                      option.value === "low" &&
                      "bg-muted text-muted-foreground hover:bg-muted/90",
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>
        </SlideOverContent>

        <SlideOverFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Save Task
          </Button>
        </SlideOverFooter>
      </form>
    </SlideOver>
  );
}
