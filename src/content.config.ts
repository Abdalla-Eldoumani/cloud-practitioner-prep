import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Lessons are MDX files under src/content/lessons. Each lesson is tagged to one
// of the four exam domains and to a study-plan day so the site can present the
// same body of content as a domain syllabus and as a seven-day path.
const lessons = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/lessons" }),
  schema: z.object({
    title: z.string().min(8).max(90),
    description: z.string().max(180),
    // Exam domain: 1 Cloud Concepts, 2 Security and Compliance,
    // 3 Cloud Technology and Services, 4 Billing, Pricing, and Support.
    domain: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    // Source course module (1-13) the lesson maps to, for cross-referencing notes.
    module: z.number().int().min(1).max(13),
    // Ordering within the domain syllabus.
    order: z.number().int().min(0),
    // Study-plan day (1-7) the lesson is assigned to. Day 0 means unscheduled.
    day: z.number().int().min(0).max(7).default(0),
    estimatedMinutes: z.number().int().min(1).max(120),
    // AWS services named in the lesson, used for tags and the service index.
    services: z.array(z.string()).default([]),
    // Date the lesson body was last checked against current AWS documentation.
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { lessons };
