import { useEffect } from "react";
import { useCalendarStore } from "../stores/calendar-store";
import { useDocumentsStore } from "../stores/documents-store";

/**
 * Initialize app data by fetching tasks, events, stats, and documents from the API.
 * Call this hook once in the root layout.
 */
export function useInitialize() {
  const fetchTasks = useCalendarStore((s) => s.fetchTasks);
  const fetchEvents = useCalendarStore((s) => s.fetchEvents);
  const fetchStats = useCalendarStore((s) => s.fetchStats);
  const fetchDocuments = useDocumentsStore((s) => s.fetchDocuments);
  const fetchFolders = useDocumentsStore((s) => s.fetchFolders);

  useEffect(() => {
    fetchTasks();
    fetchEvents();
    fetchStats();
    fetchDocuments();
    fetchFolders();
  }, [fetchTasks, fetchEvents, fetchStats, fetchDocuments, fetchFolders]);
}
