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
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  cn,
} from "@repo/ui";
import { Link } from "react-router";
import { formatDate, useCalendarStore } from "../../stores/calendar-store";
import { useDocumentsStore } from "../../stores/documents-store";

/**
 * DashboardPage - Home view for Pizza Study.
 *
 * Shows:
 * - Greeting with current date
 * - Today's tasks
 * - Upcoming events
 * - Progress stats
 * - Quick access cards
 */
export function DashboardPage() {
  const today = new Date();
  const greeting = getGreeting();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {greeting} 👋
        </h1>
        <p className="text-muted-foreground">
          {formatDate(today, "EEEE, MMMM d, yyyy")}
        </p>
      </header>

      {/* Main grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Tasks - spans 2 columns on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Today's Tasks</CardTitle>
              <CardDescription>Focus on what matters</CardDescription>
            </div>
            <Link
              to="/calendar"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            <TodayTasksList />
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progress</CardTitle>
            <CardDescription>Keep the momentum going</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressStats />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming</CardTitle>
              <CardDescription>Next on your schedule</CardDescription>
            </div>
            <Link
              to="/calendar"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Calendar <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            <UpcomingEventsList />
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Access</CardTitle>
            <CardDescription>Jump right in</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickAccessGrid />
          </CardContent>
        </Card>
      </div>
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

/**
 * Today's tasks list component.
 */
function TodayTasksList() {
  const { getTodaysTasks, toggleTaskComplete } = useCalendarStore();
  const tasks = getTodaysTasks();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={48}
          className="mx-auto mb-3 opacity-30"
        />
        <p>No tasks for today. Enjoy your free time! 🎉</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border bg-card",
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-16 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statItems.map((stat) => (
        <div key={stat.label} className="flex items-center gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-lg bg-muted flex items-center justify-center",
              stat.color,
            )}
          >
            <HugeiconsIcon icon={stat.icon} size={20} />
          </div>
          <div>
            <p className="text-2xl font-serif font-bold">
              {stat.value}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1">
                {stat.unit}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
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
      <div className="text-center py-8 text-muted-foreground">
        <HugeiconsIcon
          icon={Calendar03Icon}
          size={48}
          className="mx-auto mb-3 opacity-30"
        />
        <p>No upcoming events</p>
      </div>
    );
  }

  const eventTypeColors = {
    "study-session": "secondary",
    exam: "destructive",
    deadline: "accent",
    review: "muted",
  } as const;

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3">
          <div className="text-center min-w-[3rem]">
            <p className="text-xs text-muted-foreground uppercase">
              {formatDate(event.date, "EEE")}
            </p>
            <p className="text-lg font-bold">{formatDate(event.date, "d")}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{event.title}</p>
            {event.startTime && (
              <p className="text-xs text-muted-foreground">
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </p>
            )}
          </div>
          <Badge variant={eventTypeColors[event.type]} size="sm">
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
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      to: "/calendar",
      icon: Calendar03Icon,
      label: "Calendar",
      description: "Plan your week",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      to: "/chat",
      icon: Chat01Icon,
      label: "Start Chat",
      description: "Ask anything",
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.to}
          to={card.to}
          className="group p-4 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
              card.color,
            )}
          >
            <HugeiconsIcon icon={card.icon} size={20} />
          </div>
          <p className="font-medium text-sm group-hover:text-primary transition-colors">
            {card.label}
          </p>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}
