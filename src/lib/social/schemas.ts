import { z } from "zod";
import { ALL_PLATFORMS, SOCIAL_PLATFORMS } from "@/lib/types";

export const platformSchema = z.enum(ALL_PLATFORMS);
export const socialPlatformSchema = z.enum(SOCIAL_PLATFORMS);

export const publishSchema = z.object({
  postId: z.string().min(1),
  platform: platformSchema,
  text: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
  scheduledAt: z.string().optional(),
});

export const connectSchema = z.discriminatedUnion("platform", [
  z.object({
    platform: z.literal("vk"),
    accessToken: z.string().min(10),
    groupId: z.string().min(1),
  }),
  z.object({
    platform: z.literal("ok"),
    accessToken: z.string().min(10),
    applicationKey: z.string().min(5),
    groupId: z.string().min(1),
  }),
  z.object({
    platform: z.literal("max"),
    accessToken: z.string().min(10),
    channelId: z.string().min(1),
  }),
  z.object({
    platform: z.literal("instagram"),
    accessToken: z.string().min(10),
    igUserId: z.string().min(2),
    defaultImageUrl: z.string().url().optional(),
  }),
]);
