import { app } from "@/lib/elysia";

// Export Elysia's fetch method for all HTTP methods
// This integrates Elysia with Next.js App Router
export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;
