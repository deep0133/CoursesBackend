import express from "express";
import {
  getAllUser,
  loginUser,
  logout,
  myProfile,
  registerUser,
  changePassword,
  updareProfilePicture,
  updateProfile,
  forgotPassword,
  resetpassword,
  addToPlayList,
  removeFromPlayList,
  updateRole,
  deleteUser,
  deleteMyProfile,
} from "../controlllers/userController.js";
import { isAuthenticated, authenticateAdmin } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";
const router = express.Router();

// Register:
router.route("/register").post(singleUpload, registerUser);

// Login:
router.route("/login").post(loginUser);

// Logout:
router.route("/logout").get(logout);

// Get My Profile:
router.route("/me").get(isAuthenticated, myProfile);

// Delete My Profile:
router.route("/me").delete(isAuthenticated, deleteMyProfile);

// ChangePassword:
router.route("/change/password").put(isAuthenticated, changePassword);

// UpdateProfile:
router.route("/update/profile").put(isAuthenticated, updateProfile);

// UpdateProfilePicture:
router
  .route("/udpate/avatar")
  .put(isAuthenticated, singleUpload, updareProfilePicture);

// ForgotPassword:
router.route("/forgot/password").post(forgotPassword);

// ResetPasword:
router.route("/reset/password/:token").post(resetpassword);

// Add To PlayList:
router.route("/addtoplaylist").post(isAuthenticated, addToPlayList);

// Remove From PlayList:
router
  .route("/remvovefromplaylist")
  .delete(isAuthenticated, removeFromPlayList);

// Admin Routes:

// Get All User:
router
  .route("/admin/users")
  .get(isAuthenticated, authenticateAdmin, getAllUser);

// Updae User Role:
router
  .route("/update/role/:id")
  .put(isAuthenticated, authenticateAdmin, updateRole);

// Delete User:
router
  .route("/delete/user/:id")
  .delete(isAuthenticated, authenticateAdmin, deleteUser);

export default router;
