import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { handleZodError, sendResponse } from "../types/response";

export const asyncHandler =
	(fn: (req: Request, res: Response, next?: NextFunction) => Promise<any>) =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

export const validateRequest =
	(schema: ZodSchema, location: "body" | "query" | "params" = "body") =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			const dataToValidate =
				location === "body"
					? req.body
					: location === "query"
						? req.query
						: req.params;
			const validated = schema.parse(dataToValidate);

			if (location === "body") {
				req.body = validated;
			} else if (location === "query") {
				req.query = validated;
			} else {
				req.params = validated;
			}

			next();
		} catch (error: unknown) {
			if (error instanceof Error && error.name === "ZodError") {
				const { error: msg, details } = handleZodError(error as any);
				return sendResponse(res, 400, undefined, msg);
			}
			next(error);
		}
	};

export const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error(err);

	if (err.name === "ApiError") {
		const { statusCode, message } = err as any;
		return sendResponse(res, statusCode, undefined, message);
	}

	sendResponse(res, 500, undefined, "Internal server error");
};
