import express from "express";
import {
  buySubscription,
  cancelSubscription,
  getRazorPayKey,
  paymentVerification,
} from "../controlllers/paymentController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Buy Subscription:
router.route("/subscribe").post(isAuthenticated, buySubscription);

// Get RazorPay Key:
router.route("/getRazorKey").get(isAuthenticated, getRazorPayKey);

// Verify Payment:
router.route("/paymentVerification").post(isAuthenticated, paymentVerification);

// Cancel Subscription:
router.route("/Subscribe/cancel").post(isAuthenticated, cancelSubscription);

export default router;
