import { Response } from "express";
import { ZodError } from "zod";

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	details?: Record<string, unknown>;
}

export class ApiError extends Error {
	constructor(
		public statusCode: number,
		message: string,
		public details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export function sendResponse<T>(
	res: Response,
	statusCode: number,
	data?: T,
	error?: string,
): Response {
	const response: ApiResponse<T> = {
		success: statusCode >= 200 && statusCode < 300,
		...(data && { data }),
		...(error && { error }),
	};
	return res.status(statusCode).json(response);
}

export function handleZodError(error: ZodError): {
	error: string;
	details: Record<string, unknown>;
} {
	const details = error.errors.reduce(
		(acc, err) => {
			const path = err.path.join(".");
			acc[path] = err.message;
			return acc;
		},
		{} as Record<string, unknown>,
	);

	return {
		error: "Validation failed",
		details,
	};
}
