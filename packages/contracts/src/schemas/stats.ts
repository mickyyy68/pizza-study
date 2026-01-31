import { z } from "zod";

export const studyStatsSchema = z.object({
  tasksCompletedToday: z.number(),
  tasksCompletedThisWeek: z.number(),
  studyStreak: z.number(),
  documentsReviewed: z.number(),
  totalStudyMinutes: z.number(),
});

export type StudyStats = z.infer<typeof studyStatsSchema>;
