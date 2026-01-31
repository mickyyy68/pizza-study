import { useEffect } from "react";
import { useCalendarStore } from "../stores/calendar-store";

/**
 * Initialize app data by fetching tasks, events, and stats from the API.
 * Call this hook once in the root layout.
 */
export function useInitialize() {
  const fetchTasks = useCalendarStore((s) => s.fetchTasks);
  const fetchEvents = useCalendarStore((s) => s.fetchEvents);
  const fetchStats = useCalendarStore((s) => s.fetchStats);

  useEffect(() => {
    fetchTasks();
    fetchEvents();
    fetchStats();
  }, [fetchTasks, fetchEvents, fetchStats]);
}
