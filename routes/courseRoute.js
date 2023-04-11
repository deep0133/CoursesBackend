import express from "express";
import {
  getAllCourses,
  createCourse,
  getCourseLecture,
  addLecture,
  deleteLecture,
  deleteCourse,
} from "../controlllers/courseController.js";
import {
  authenticateAdmin,
  authorizeSubscriber,
  isAuthenticated,
} from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";

const router = express.Router();

// Get All Courses without lectures:
router.route("/course").get(getAllCourses);

// Create New Course - only admin
router
  .route("/createcourse")
  .post(isAuthenticated, authenticateAdmin, singleUpload, createCourse);

//  Get Course Details/Lectures: admin
router
  .route("/course/:id")
  .get(isAuthenticated, authorizeSubscriber, getCourseLecture);

// Add Lecture
router
  .route("/course/:id")
  .post(isAuthenticated, authenticateAdmin, singleUpload, addLecture);
// Delete course:
router
  .route("/course/:id")
  .delete(isAuthenticated, authenticateAdmin, singleUpload, deleteCourse);

// Delete Lecture
router
  .route("/lecture")
  .delete(isAuthenticated, authenticateAdmin, singleUpload, deleteLecture);

export default router;
