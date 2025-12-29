import { treaty } from "@elysiajs/eden";
import type { App } from "./elysia";
import { app } from "./elysia";

// Isomorphic Eden client
// - On Server: directly calls Elysia without going through the network layer
// - On Client: calls Elysia through the network layer
export const api =
	typeof window === "undefined"
		? treaty(app).api
		: treaty<App>(
				typeof window !== "undefined"
					? window.location.origin
					: "localhost:3000",
			).api;
