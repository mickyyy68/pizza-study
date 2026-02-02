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
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { formatDate, useCalendarStore } from "../../stores/calendar-store";
import type { CalendarEvent, Task } from "../../types";

const priorityOrder: Record<Task["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const typeIcons: Record<CalendarEvent["type"], IconSvgElement> = {
  "study-session": BookOpen01Icon,
  exam: AlertCircleIcon,
  deadline: Clock01Icon,
  review: CheckmarkCircle02Icon,
};

const typeBadgeStyles: Record<CalendarEvent["type"], string> = {
  "study-session": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  exam: "bg-destructive/10 text-destructive",
  deadline: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  review: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const typeDotStyles: Record<CalendarEvent["type"], string> = {
  "study-session": "bg-blue-500",
  exam: "bg-destructive",
  deadline: "bg-amber-500",
  review: "bg-emerald-500",
};

function parseTimeToMinutes(time?: string | null) {
  if (!time) return Number.POSITIVE_INFINITY;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours)) return Number.POSITIVE_INFINITY;
  return hours * 60 + (Number.isNaN(minutes) ? 0 : minutes);
}

/**
 * CalendarPage - Agenda-first planning view for Pizza Study.
 */
export function CalendarPage() {
  const {
    tasks,
    events,
    selectedDate,
    navigateMonth,
    goToToday,
    getCalendarDays,
    addTask,
    addEvent,
    error,
    clearError,
    fetchTasks,
    fetchEvents,
    setSelectedDate,
    getUpcomingEvents,
  } = useCalendarStore();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const days = getCalendarDays();
  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const selectedTasks = useMemo(
    () => tasks.filter((task) => isSameDay(task.dueDate, selectedDate)),
    [tasks, selectedDate],
  );
  const selectedEvents = useMemo(
    () => events.filter((event) => isSameDay(event.date, selectedDate)),
    [events, selectedDate],
  );

  const sortedEvents = useMemo(
    () =>
      [...selectedEvents].sort(
        (a, b) =>
          parseTimeToMinutes(a.startTime) -
          parseTimeToMinutes(b.startTime),
      ),
    [selectedEvents],
  );

  const sortedTasks = useMemo(
    () =>
      [...selectedTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return Number(a.completed) - Number(b.completed);
        }
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
    [selectedTasks],
  );

  const upcomingEvents = getUpcomingEvents(4);
  const hasAgenda = sortedEvents.length > 0 || sortedTasks.length > 0;

  const handleRetry = () => {
    clearError();
    fetchTasks();
    fetchEvents();
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    setSelectedDate(
      direction === "prev"
        ? subWeeks(selectedDate, 1)
        : addWeeks(selectedDate, 1),
    );
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,244,235,0.9),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(219,239,255,0.7),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(46,30,24,0.7),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(20,30,48,0.8),transparent_45%)]" />

      {/* Error Banner */}
      {error && (
        <div className="absolute top-0 left-0 right-0 z-50 border-b border-destructive/20 bg-destructive/10 p-3 flex items-center justify-between">
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

      <div className="relative z-10 flex h-full w-full flex-col gap-6 p-6">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                Agenda
              </p>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                {formatDate(selectedDate, "EEEE, MMMM d")}
              </h1>
              <p className="text-sm text-muted-foreground">
                Week of {format(weekStart, "MMM d")} ·{" "}
                {formatDate(selectedDate, "MMMM yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center rounded-full border border-border bg-background/80 p-1 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleWeekChange("prev")}
                  aria-label="Previous week"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleWeekChange("next")}
                  aria-label="Next week"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Week Strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weekDays.map((day) => (
              <WeekDayPill key={day.toISOString()} date={day} />
            ))}
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 min-h-0">
          <main className="flex flex-col gap-4 min-h-0">
            {/* Agenda Card */}
            <section className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-semibold">
                    Daily Agenda
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Plan sessions, track tasks, and stay focused.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddEventOpen(true)}
                  >
                    <HugeiconsIcon icon={Clock01Icon} size={14} className="mr-1" />
                    Add Event
                  </Button>
                  <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
                    <HugeiconsIcon icon={Add01Icon} size={14} className="mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>

              {!hasAgenda ? (
                <div className="mt-6 rounded-xl border border-dashed border-border/70 bg-muted/40 p-6 text-center">
                  <EmptyState
                    icon={<HugeiconsIcon icon={Clock01Icon} size={20} />}
                    title="Nothing scheduled yet"
                    description="Add a study block or a focus task to get started."
                    size="sm"
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddEventOpen(true)}
                    >
                      Add Event
                    </Button>
                    <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
                      Add Task
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                        Schedule
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {sortedEvents.length} events
                      </span>
                    </div>
                    {sortedEvents.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No scheduled sessions yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {sortedEvents.map((event, index) => (
                          <AgendaEventItem
                            key={event.id}
                            event={event}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                        Tasks
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {sortedTasks.length} tasks
                      </span>
                    </div>
                    {sortedTasks.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No tasks planned for this day.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {sortedTasks.map((task, index) => (
                          <TaskItem key={task.id} task={task} index={index} />
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Mobile-only cards */}
            <div className="grid gap-4 xl:hidden">
              <MiniMonthCard days={days} />
              <UpcomingCard events={upcomingEvents} />
            </div>
          </main>

          {/* Desktop Sidebar */}
          <aside className="hidden xl:flex flex-col gap-4">
            <MiniMonthCard days={days} />
            <UpcomingCard events={upcomingEvents} />
          </aside>
        </div>
      </div>

      {/* Add Task SlideOver */}
      <AddTaskSlideOver
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        defaultDate={selectedDate}
        onAddTask={addTask}
      />

      {/* Add Event SlideOver */}
      <AddEventSlideOver
        open={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        defaultDate={selectedDate}
        onAddEvent={addEvent}
      />
    </div>
  );
}

function WeekDayPill({ date }: { date: Date }) {
  const { tasks, events, selectedDate, setSelectedDate } = useCalendarStore();
  const isSelected = isSameDay(date, selectedDate);
  const isTodayDate = isToday(date);
  const hasItems =
    tasks.some((task) => isSameDay(task.dueDate, date)) ||
    events.some((event) => isSameDay(event.date, date));

  return (
    <button
      type="button"
      onClick={() => setSelectedDate(date)}
      className={cn(
        "relative flex min-w-[92px] flex-col items-start gap-1 rounded-2xl border px-3 py-2 text-left transition-all",
        "bg-background/80 hover:bg-accent/40",
        isSelected &&
          "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary",
        isTodayDate && !isSelected && "ring-2 ring-primary/30",
      )}
    >
      <span className={cn("text-[11px] uppercase tracking-[0.2em]", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
        {format(date, "EEE")}
      </span>
      <span className="text-lg font-semibold">{format(date, "d")}</span>
      {hasItems && !isSelected && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  );
}

function MiniMonthCard({ days }: { days: Date[] }) {
  const { currentMonth, navigateMonth } = useCalendarStore();

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {formatDate(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex items-center rounded-full border border-border bg-background/80 p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            aria-label="Previous month"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            aria-label="Next month"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-[10px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="text-center font-semibold">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day) => (
          <MiniDayCell key={day.toISOString()} date={day} />
        ))}
      </div>
    </section>
  );
}

function MiniDayCell({ date }: { date: Date }) {
  const { tasks, events, currentMonth, selectedDate, setSelectedDate } =
    useCalendarStore();

  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isSelected = isSameDay(date, selectedDate);
  const isTodayDate = isToday(date);
  const hasItems =
    tasks.some((task) => isSameDay(task.dueDate, date)) ||
    events.some((event) => isSameDay(event.date, date));

  return (
    <button
      type="button"
      onClick={() => setSelectedDate(date)}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-all",
        "hover:bg-accent/40",
        !isCurrentMonth && "text-muted-foreground/40",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary",
        isTodayDate && !isSelected && "ring-1 ring-primary/40",
      )}
    >
      {format(date, "d")}
      {hasItems && !isSelected && (
        <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

function AgendaEventItem({
  event,
  index,
}: {
  event: CalendarEvent;
  index: number;
}) {
  const icon = typeIcons[event.type];
  const timeLabel = event.startTime
    ? event.endTime
      ? `${event.startTime} - ${event.endTime}`
      : event.startTime
    : "Any time";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3 shadow-sm",
        "animate-fade-in-up",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <span
          className={cn("h-2 w-2 rounded-full", typeDotStyles[event.type])}
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {timeLabel}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{event.title}</p>
      </div>
      <Badge className={typeBadgeStyles[event.type]} variant="muted" size="sm">
        <HugeiconsIcon icon={icon} size={12} className="mr-1" />
        {event.type.replace("-", " ")}
      </Badge>
    </div>
  );
}

function UpcomingCard({ events }: { events: CalendarEvent[] }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Upcoming</h3>
        <Badge variant="muted" size="sm">
          Next {events.length || 0}
        </Badge>
      </div>

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No upcoming events yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map((event) => (
            <UpcomingEventItem key={event.id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}

function UpcomingEventItem({ event }: { event: CalendarEvent }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(event.date, "MMM d")} · {event.startTime ?? "Any time"}
        </p>
      </div>
      <Badge className={typeBadgeStyles[event.type]} variant="muted" size="sm">
        {event.type.replace("-", " ")}
      </Badge>
    </li>
  );
}

/**
 * Task item component for agenda list.
 */
function TaskItem({
  task,
  index = 0,
}: {
  task: ReturnType<typeof useCalendarStore.getState>["tasks"][0];
  index?: number;
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
        "animate-fade-in-up",
        priorityStyles[task.priority],
      )}
      style={{ animationDelay: `${index * 40}ms` }}
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

/**
 * AddEventSlideOver - Form to create new events.
 */
function AddEventSlideOver({
  open,
  onClose,
  defaultDate,
  onAddEvent,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
  onAddEvent: (
    event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<CalendarEvent["type"]>("study-session");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDate(format(defaultDate, "yyyy-MM-dd"));
      setStartTime("");
      setEndTime("");
      setType("study-session");
      setError("");
      setTimeout(() => {
        document.getElementById("event-title")?.focus();
      }, 100);
    }
  }, [open, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      document.getElementById("event-title")?.focus();
      return;
    }

    onAddEvent({
      title: title.trim(),
      date: new Date(date),
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      type,
      documentIds: [],
      color: undefined,
    });

    onClose();
  };

  const typeOptions: { value: CalendarEvent["type"]; label: string }[] = [
    { value: "study-session", label: "Study" },
    { value: "exam", label: "Exam" },
    { value: "deadline", label: "Deadline" },
    { value: "review", label: "Review" },
  ];

  return (
    <SlideOver open={open} onClose={onClose} side="right" size="md">
      <SlideOverHeader onClose={onClose}>Add Event</SlideOverHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <SlideOverContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="event-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter event title"
              className={cn(
                error && "border-destructive focus:border-destructive",
              )}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="event-date" className="text-sm font-medium">
              Date
            </label>
            <Input
              id="event-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="event-start" className="text-sm font-medium">
                Start time
              </label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="event-end" className="text-sm font-medium">
                End time
              </label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Type</legend>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={type === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setType(option.value)}
                  className={cn(
                    "justify-center",
                    type === option.value &&
                      option.value === "exam" &&
                      "bg-destructive hover:bg-destructive/90",
                    type === option.value &&
                      option.value === "deadline" &&
                      "bg-amber-500 text-white hover:bg-amber-500/90",
                    type === option.value &&
                      option.value === "review" &&
                      "bg-emerald-500 text-white hover:bg-emerald-500/90",
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
            Save Event
          </Button>
        </SlideOverFooter>
      </form>
    </SlideOver>
  );
}
