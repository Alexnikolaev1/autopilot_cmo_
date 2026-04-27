import type { GeneratedPost } from "@/lib/types";

interface ScheduledPost extends GeneratedPost {
  scheduledFor: Date;
  projectId: string;
}

// In-memory scheduler — replace with Vercel Cron + DB in production
const scheduledPosts: ScheduledPost[] = [];

export class Scheduler {
  schedulePost(post: GeneratedPost, date: Date, projectId: string): ScheduledPost {
    const scheduled: ScheduledPost = {
      ...post,
      scheduledFor: date,
      projectId,
      status: "scheduled",
      scheduledAt: date.toISOString(),
    };
    scheduledPosts.push(scheduled);
    return scheduled;
  }

  getScheduledPosts(projectId?: string): ScheduledPost[] {
    if (projectId) {
      return scheduledPosts.filter((p) => p.projectId === projectId);
    }
    return scheduledPosts;
  }

  getUpcomingPosts(hoursAhead = 24): ScheduledPost[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    return scheduledPosts.filter(
      (p) => p.scheduledFor >= now && p.scheduledFor <= cutoff
    );
  }

  removePost(postId: string): boolean {
    const index = scheduledPosts.findIndex((p) => p.id === postId);
    if (index !== -1) {
      scheduledPosts.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const scheduler = new Scheduler();
