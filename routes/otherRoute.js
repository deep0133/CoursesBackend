import express from "express";
import {
  contact,
  getDashboardStats,
  requestCourse,
} from "../controlllers/otherController.js";
import { authenticateAdmin, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Contact Form:
router.route("/contact").post(isAuthenticated, contact);

// Request Course Form:
router.route("/courserequest").post(isAuthenticated, requestCourse);

// Access Admin DashBoard:
router
  .route("/admin/stats")
  .get(isAuthenticated, authenticateAdmin, getDashboardStats);

export default router;
