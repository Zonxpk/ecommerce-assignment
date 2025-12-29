import { Router } from "express";

const router = Router();

// Placeholder for webhook routes
// These will be used for marketplace integrations (Lazada, Shopee webhooks)

router.post("/shopee/:campaignId", (req, res) => {
	// TODO: Handle Shopee webhooks
	res.json({ success: true, message: "Shopee webhook endpoint" });
});

router.post("/lazada/:campaignId", (req, res) => {
	// TODO: Handle Lazada webhooks
	res.json({ success: true, message: "Lazada webhook endpoint" });
});

export default router;
