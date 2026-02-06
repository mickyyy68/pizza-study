import {
  Add01Icon,
  Analytics01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FireIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Badge, buttonVariants, Checkbox, cn } from "@repo/ui";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTheme } from "../../hooks/useTheme";
import { formatDate, useCalendarStore } from "../../stores/calendar-store";
import type { CalendarEvent, Task } from "../../types";

const eventTypeVariants = {
  "study-session": "secondary",
  exam: "destructive",
  deadline: "warning",
  review: "success",
} as const;

type ScheduleBadgeVariant =
  | "secondary"
  | "destructive"
  | "warning"
  | "success"
  | "accent"
  | "muted";

type ScheduleItem =
  | {
      id: string;
      kind: "event";
      title: string;
      date: Date;
      startTime?: string;
      endTime?: string;
      eventType: CalendarEvent["type"];
    }
  | {
      id: string;
      kind: "task";
      title: string;
      date: Date;
      completed: boolean;
      priority: Task["priority"];
    };

/**
 * Dashboard page styled to match the "Focus" board layout.
 */
export function DashboardPage() {
  const today = new Date();
  const greeting = getGreeting();
  const { cycleTheme, resolvedTheme } = useTheme();

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-3 overflow-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header className="flex items-center justify-end">
        <button
          type="button"
          onClick={cycleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground transition-colors hover:bg-muted/70"
          aria-label="Toggle theme"
        >
          <HugeiconsIcon
            icon={resolvedTheme === "dark" ? Sun03Icon : Moon02Icon}
            size={18}
          />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_240px]">
        <LeftRail greeting={greeting} today={today} />

        <div className="grid min-h-0 gap-4 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <TasksPanel />
          <SchedulePanel />
        </div>

        <InsightsPanel />
      </div>
    </div>
  );
}

function LeftRail({ greeting, today }: { greeting: string; today: Date }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold leading-[0.95] text-foreground sm:text-4xl">
          {greeting}
        </h1>
        <div className="flex items-center gap-2">
          <span className="h-5 w-[2px] rounded-full bg-primary" />
          <p className="text-sm text-muted-foreground">
            {formatDate(today, "EEEE, MMM d")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          to="/calendar"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 w-full justify-between rounded-xl px-3 text-sm",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={Calendar03Icon} size={18} />
            Plan the day
          </span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </Link>

        <Link
          to="/calendar"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full justify-between rounded-xl px-3 text-sm",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={Calendar03Icon} size={18} />
            Open calendar
          </span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </Link>
      </div>
    </aside>
  );
}

function TasksPanel() {
  const navigate = useNavigate();
  const { getTodaysTasks, toggleTaskComplete } = useCalendarStore();
  const tasks = getTodaysTasks();
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  return (
    <section className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
      <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-primary/6" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground md:text-3xl">
            Today&apos;s Tasks
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Focus on the work that moves you forward.
          </p>
        </div>

        {/* '+' button for adding a new task */}
        <button
          type="button"
          onClick={() => navigate("/calendar?addTask=1")}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:bg-muted"
          aria-label="Add task"
        >
          <HugeiconsIcon icon={Add01Icon} size={20} />
        </button>
      </div>

      <div className="relative mt-4 flex-1 rounded-xl border border-dashed border-border/80 bg-background/45 p-4 md:p-5">
        {tasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-card">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={20}
                className="text-primary/80"
              />
            </span>
            <p className="mt-3 text-xl font-semibold text-foreground md:text-2xl">
              All clear for now
            </p>
            <p className="mt-2 max-w-md text-xs text-muted-foreground md:text-sm">
              You have no pending tasks. Enjoy the quiet momentum or add a new
              task to get started.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col space-y-3 overflow-auto pr-1">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
              {pendingTasks} pending
            </p>
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-3"
                >
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTaskComplete(task.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.completed && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-1 text-xs text-muted-foreground truncate">
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
          </div>
        )}
      </div>
    </section>
  );
}

function SchedulePanel() {
  const { events, tasks } = useCalendarStore();
  const scheduleItems = buildScheduleItems(events, tasks);
  const [view, setView] = useState<"timeline" | "list">("timeline");

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground md:text-3xl">
            Schedule
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your upcoming blocks.
          </p>
        </div>
        <div className="inline-flex gap-2">
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              view === "timeline"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              view === "list"
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            List
          </button>
        </div>
      </div>

      {scheduleItems.length === 0 ? (
        <div className="mt-4 flex-1 rounded-xl border border-dashed border-border/80 bg-background/45 p-5 text-center text-sm text-muted-foreground">
          No schedule items yet. Add events or tasks in calendar to see them
          here.
        </div>
      ) : view === "timeline" ? (
        <ul className="mt-4 space-y-4 overflow-auto pr-1">
          {scheduleItems.map((item, index) => (
            <li
              key={`${item.kind}-${item.id}`}
              className="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-start md:gap-4"
            >
              <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                {getScheduleMarker(item, index)}
              </p>

              <div className="relative pl-4">
                <span
                  className={cn(
                    "absolute left-0 top-1 h-8 w-px rounded-full",
                    index === 0 && isUpcomingItem(item)
                      ? "bg-primary"
                      : "bg-border",
                  )}
                />
                <p className="text-xl font-medium text-foreground md:text-2xl">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {getScheduleMeta(item)}
                </p>
              </div>

              <Badge
                variant={getScheduleBadgeVariant(item)}
                size="sm"
                className="h-fit justify-self-start md:justify-self-end"
              >
                {getScheduleBadgeLabel(item)}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 space-y-3 overflow-auto pr-1">
          {scheduleItems.map((item) => (
            <li
              key={`${item.kind}-${item.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getScheduleMeta(item)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">
                  {formatDate(item.date, "MMM d")}
                </Badge>
                <Badge variant={getScheduleBadgeVariant(item)} size="sm">
                  {getScheduleBadgeLabel(item)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function InsightsPanel() {
  const { stats, statsLoading } = useCalendarStore();

  const streak = stats?.studyStreak ?? 0;
  const completed = stats?.tasksCompletedToday ?? 0;
  const weekTotal = stats?.tasksCompletedThisWeek ?? 0;
  const hours = ((stats?.totalStudyMinutes ?? 0) / 60).toFixed(1);

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <HugeiconsIcon
          icon={Analytics01Icon}
          size={15}
          className="text-primary"
        />
        Insights
      </div>

      <h2 className="mt-2 text-2xl font-serif font-semibold leading-tight text-foreground md:text-3xl">
        Focus Snapshot
      </h2>

      <div className="mt-4 space-y-2.5 overflow-auto pr-1">
        {statsLoading ? (
          <>
            <div className="h-24 animate-pulse rounded-xl border border-border/70 bg-muted/40" />
            <div className="h-24 animate-pulse rounded-xl border border-border/70 bg-muted/40" />
            <div className="h-20 animate-pulse rounded-xl border border-border/70 bg-muted/40" />
          </>
        ) : (
          <>
            <InsightStatCard
              label="Streak"
              icon={FireIcon}
              iconClassName="text-orange-500"
              value={streak}
              suffix="days"
              footnote={`${Math.max(0, 14 - streak)} days to hit a 2-week run`}
              progress={Math.min(100, (streak / 14) * 100)}
            />
            <InsightStatCard
              label="Completed"
              icon={CheckmarkCircle02Icon}
              iconClassName="text-emerald-500"
              value={completed}
              suffix="tasks"
              footnote={`${weekTotal} finished this week`}
            />
            <InsightStatCard
              label="Hours"
              icon={Clock01Icon}
              iconClassName="text-blue-500"
              value={hours}
              suffix="hrs"
            />
          </>
        )}
      </div>
    </aside>
  );
}

interface InsightStatCardProps {
  label: string;
  value: number | string;
  suffix: string;
  icon: IconSvgElement;
  iconClassName: string;
  footnote?: string;
  progress?: number;
}

function InsightStatCard({
  label,
  value,
  suffix,
  icon,
  iconClassName,
  footnote,
  progress,
}: InsightStatCardProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/70 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <HugeiconsIcon icon={icon} size={16} className={iconClassName} />
      </div>

      <p className="mt-2 text-2xl font-serif font-semibold text-foreground">
        {value}
        <span className="ml-1 text-base font-sans text-muted-foreground">
          {suffix}
        </span>
      </p>

      {typeof progress === "number" && (
        <div className="mt-3 h-1.5 rounded-full bg-border/80">
          <div
            className="h-full rounded-full bg-orange-500"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      )}

      {footnote && (
        <p className="mt-2 text-xs text-muted-foreground">{footnote}</p>
      )}
    </div>
  );
}

function formatTimelineMarker(time?: string): string {
  if (!time) return "Soon";
  return formatSingleTime(time);
}

function buildScheduleItems(
  events: CalendarEvent[],
  tasks: Task[],
): ScheduleItem[] {
  const merged: ScheduleItem[] = [
    ...events.map((event) => ({
      id: event.id,
      kind: "event" as const,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      eventType: event.type,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      kind: "task" as const,
      title: task.title,
      date: task.dueDate,
      completed: task.completed,
      priority: task.priority,
    })),
  ];

  const now = Date.now();
  return merged.sort((a, b) => {
    const aTime = getScheduleTimestamp(a);
    const bTime = getScheduleTimestamp(b);
    const aPast = aTime < now;
    const bPast = bTime < now;

    if (aPast !== bPast) return aPast ? 1 : -1;
    if (aPast && bPast) return bTime - aTime;
    return aTime - bTime;
  });
}

function getScheduleTimestamp(item: ScheduleItem): number {
  const date = new Date(item.date);

  if (item.kind === "event" && item.startTime) {
    const [hours, minutes] = item.startTime.split(":").map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      date.setHours(hours, minutes, 0, 0);
    }
  }

  return date.getTime();
}

function isUpcomingItem(item: ScheduleItem): boolean {
  return getScheduleTimestamp(item) >= Date.now();
}

function getScheduleMarker(item: ScheduleItem, index: number): string {
  if (index === 0 && isUpcomingItem(item)) return "Now";
  if (item.kind === "event") return formatTimelineMarker(item.startTime);
  return formatDate(item.date, "MMM d");
}

function getScheduleMeta(item: ScheduleItem): string {
  if (item.kind === "event") {
    return `${formatTimeRange(item.startTime, item.endTime)} - ${item.eventType.replace("-", " ")}`;
  }

  const taskState = item.completed ? "completed" : `${item.priority} priority`;
  return `${formatDate(item.date, "MMM d")} - task ${taskState}`;
}

function getScheduleBadgeVariant(item: ScheduleItem): ScheduleBadgeVariant {
  if (item.kind === "event") return eventTypeVariants[item.eventType];

  if (item.completed) return "success";
  if (item.priority === "high") return "destructive";
  if (item.priority === "medium") return "accent";
  return "muted";
}

function getScheduleBadgeLabel(item: ScheduleItem): string {
  if (item.kind === "event") return item.eventType.replace("-", " ");
  if (item.completed) return "done";
  return `${item.priority} task`;
}

function formatTimeRange(startTime?: string, endTime?: string): string {
  if (!startTime && !endTime) return "Any time";
  if (startTime && endTime) {
    return `${formatSingleTime(startTime)} - ${formatSingleTime(endTime)}`;
  }
  if (startTime) return formatSingleTime(startTime);
  return `Until ${formatSingleTime(endTime ?? "")}`;
}

function formatSingleTime(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalized = hours % 12 || 12;

  return `${normalized}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
