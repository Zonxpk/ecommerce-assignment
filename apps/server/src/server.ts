import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/index";
import dashboardRoutes from "./routes/dashboard";
import productsRoutes from "./routes/products";
import webhooksRoutes from "./routes/webhooks";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/webhooks", webhooksRoutes);

// Health check
app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "ok" });
});

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({ success: false, error: "Not found" });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Health check: http://localhost:${PORT}/health`);
});
