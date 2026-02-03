import {
  ArrowRight01Icon,
  Calendar03Icon,
  Chat01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  File02Icon,
  FireIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Badge, buttonVariants, Checkbox, cn } from "@repo/ui";
import { Link } from "react-router";
import { formatDate, useCalendarStore } from "../../stores/calendar-store";
import { useDocumentsStore } from "../../stores/documents-store";

const eventTypeVariants = {
  "study-session": "secondary",
  exam: "destructive",
  deadline: "warning",
  review: "success",
} as const;

/**
 * DashboardPage - Home view for Pizza Study.
 *
 * Shows:
 * - Greeting with current date
 * - Daily focus snapshot
 * - Today's tasks
 * - Upcoming events
 * - Quick access shortcuts
 */
export function DashboardPage() {
  const today = new Date();
  const greeting = getGreeting();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8">
      {/* Hero */}
      <header className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-foreground lg:text-5xl">
              {greeting}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(today, "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/calendar"
              className={cn(buttonVariants({ variant: "default" }), "h-10")}
            >
              Plan the day
            </Link>
            <Link
              to="/calendar"
              className={cn(buttonVariants({ variant: "outline" }), "h-10")}
            >
              Open calendar
            </Link>
            <Link
              to="/chat"
              className={cn(buttonVariants({ variant: "ghost" }), "h-10")}
            >
              Ask for help
            </Link>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  Focus Mode
                </p>
                <p className="text-sm text-muted-foreground">
                  Pick one thing to finish before lunch.
                </p>
              </div>
              <Link
                to="/calendar"
                className={cn(buttonVariants({ variant: "link" }), "text-xs")}
              >
                Open agenda
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </Link>
            </div>
          </div>
        </div>

        <FocusPanel />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-serif font-semibold">
                Today's Tasks
              </h2>
              <p className="text-sm text-muted-foreground">
                Focus on the work that moves you forward.
              </p>
            </div>
            <Link
              to="/calendar"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8",
              )}
            >
              View all
            </Link>
          </div>
          <div className="mt-5">
            <TodayTasksList />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-semibold">Upcoming</h2>
              <p className="text-sm text-muted-foreground">
                Your next study blocks.
              </p>
            </div>
            <Link
              to="/calendar"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8",
              )}
            >
              Calendar
            </Link>
          </div>
          <div className="mt-5">
            <UpcomingEventsList />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-serif font-semibold">Quick Access</h2>
            <p className="text-sm text-muted-foreground">
              Jump back into your study workspace.
            </p>
          </div>
          <Link
            to="/documents"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8",
            )}
          >
            Browse library
          </Link>
        </div>
        <div className="mt-5">
          <QuickAccessGrid />
        </div>
      </section>
    </div>
  );
}

/**
 * Get time-based greeting.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function FocusPanel() {
  const { getUpcomingEvents } = useCalendarStore();
  const nextEvent = getUpcomingEvents(1)[0];

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Daily Pulse
          </p>
          <h2 className="text-xl font-serif font-semibold">Focus Snapshot</h2>
        </div>
        <Badge variant="muted" size="sm">
          Today
        </Badge>
      </div>

      <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-4">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Next up
        </p>
        {nextEvent ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {nextEvent.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(nextEvent.date, "EEE, MMM d")} -{" "}
                {nextEvent.startTime ?? "Any time"}
              </p>
            </div>
            <Badge variant={eventTypeVariants[nextEvent.type]} size="sm">
              {nextEvent.type.replace("-", " ")}
            </Badge>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            You are clear for now. Schedule a new session when ready.
          </p>
        )}
      </div>

      <div className="mt-5">
        <ProgressStats />
      </div>
    </section>
  );
}

/**
 * Today's tasks list component.
 */
function TodayTasksList() {
  const { getTodaysTasks, toggleTaskComplete } = useCalendarStore();
  const tasks = getTodaysTasks();

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-6 text-center text-muted-foreground">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={40}
          className="mx-auto mb-3 opacity-40"
        />
        <p>No tasks for today. Enjoy the quiet momentum.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3 shadow-sm transition-all",
            "hover:-translate-y-0.5 hover:shadow-md",
            task.priority === "high" && "border-l-4 border-l-destructive",
            task.priority === "medium" && "border-l-4 border-l-accent",
            task.priority === "low" &&
              "border-l-4 border-l-muted-foreground/30",
          )}
        >
          <Checkbox
            checked={task.completed}
            onChange={() => toggleTaskComplete(task.id)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium text-sm",
                task.completed && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {task.description}
              </p>
            )}
          </div>
          <Badge
            variant={
              task.priority === "high"
                ? "destructive"
                : task.priority === "medium"
                  ? "accent"
                  : "muted"
            }
            size="sm"
          >
            {task.priority}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/**
 * Progress stats component.
 */
function ProgressStats() {
  const { stats, statsLoading } = useCalendarStore();

  const statItems: {
    label: string;
    value: number;
    unit: string;
    icon: IconSvgElement;
    color: string;
  }[] = [
    {
      label: "Study Streak",
      value: stats?.studyStreak ?? 0,
      unit: "days",
      icon: FireIcon,
      color: "text-orange-500",
    },
    {
      label: "Completed Today",
      value: stats?.tasksCompletedToday ?? 0,
      unit: "tasks",
      icon: CheckmarkCircle02Icon,
      color: "text-emerald-500",
    },
    {
      label: "This Week",
      value: stats?.tasksCompletedThisWeek ?? 0,
      unit: "tasks",
      icon: Clock01Icon,
      color: "text-primary",
    },
  ];

  if (statsLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-border/60 bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border/60 bg-background/70 p-3"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{stat.label}</span>
            <HugeiconsIcon icon={stat.icon} size={14} className={stat.color} />
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-foreground">
            {stat.value}
            <span className="ml-1 text-xs font-sans font-normal text-muted-foreground">
              {stat.unit}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Upcoming events list component.
 */
function UpcomingEventsList() {
  const { getUpcomingEvents } = useCalendarStore();
  const events = getUpcomingEvents(4);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 p-6 text-center text-muted-foreground">
        <HugeiconsIcon
          icon={Calendar03Icon}
          size={40}
          className="mx-auto mb-3 opacity-40"
        />
        <p>No upcoming events yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-3 shadow-sm"
        >
          <div className="text-center min-w-[3rem]">
            <p className="text-[10px] uppercase text-muted-foreground">
              {formatDate(event.date, "EEE")}
            </p>
            <p className="text-lg font-serif font-bold">
              {formatDate(event.date, "d")}
            </p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(event.date, "MMM d")} -{" "}
              {event.startTime ?? "Any time"}
            </p>
          </div>
          <Badge variant={eventTypeVariants[event.type]} size="sm">
            {event.type.replace("-", " ")}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/**
 * Quick access grid component.
 */
function QuickAccessGrid() {
  const { documents } = useDocumentsStore();

  const cards: {
    to: string;
    icon: IconSvgElement;
    label: string;
    description: string;
    color: string;
  }[] = [
    {
      to: "/documents",
      icon: File02Icon,
      label: "Documents",
      description: `${documents.length} files`,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    },
    {
      to: "/calendar",
      icon: Calendar03Icon,
      label: "Calendar",
      description: "Plan your week",
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    {
      to: "/chat",
      icon: Chat01Icon,
      label: "Start Chat",
      description: "Ask anything",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.to}
          to={card.to}
          className="group rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                card.color,
              )}
            >
              <HugeiconsIcon icon={card.icon} size={20} />
            </div>
            <Badge variant="outline" size="sm">
              Open
            </Badge>
          </div>
          <p className="mt-3 font-medium text-sm group-hover:text-primary transition-colors">
            {card.label}
          </p>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}
