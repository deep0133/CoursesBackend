import { catchAsyncError } from "../middleware/catchAsyncError.js";
import sendEmail from "../middleware/sendMail.js";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendToken } from "../utils/SendToken.js";
import crypto from "crypto";
import Course from "../models/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/DataUrl.js";
import Stats from "../models/Stats.js";

export const registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, file } = req.body;

  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please add all fields", 401));

  console.log(
    "Name : " +
      typeof name +
      " Email : " +
      typeof email +
      " Password : " +
      typeof password +
      " File : " +
      typeof file
  );

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));

  const fileUri = getDataUri(file);
  console.log("FIle : " + file + "  File Uri : " + fileUri.content);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    folder: "users",
  });

  console.log("myCloud uploaded file: ");

  user = await User.create({
    name,
    email,
    password,
    avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
  });
  sendToken(res, user, "Registered Successfully", 201);
});

export const loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please fill all fields", 401));

  let user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect password or Email", 404));

  // check password:
  const isMatch = await user.matchPassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect password or Email", 400));

  sendToken(res, user, "Login Successfully", 201);
});

export const logout = catchAsyncError(async (req, res, next) => {
  const option = {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  res.status(200).cookie("token", null, option).json({
    success: true,
    message: "Log Out Successfully",
  });
});

export const myProfile = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Provide Old And New Password", 400));

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.matchPassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 200));

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password Updated" });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({ success: true, message: "Profile Updated" });
});

export const updareProfilePicture = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new ErrorHandler("Please add all fields", 401));

  let user = await User.findOne(req.user._id);

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    folder: "users",
  });

  await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
    folder: "users",
  });

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
  await user.save();
  res.status(200).json({ success: true, message: "Profile Picture Updated" });
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) next(new ErrorHandler("Email not exist", 404));

  const resetPasswordToken = await user.getResetPasswordToken();

  await user.save();

  const resetUrl = `${process.env.Frontend_URL}/reset/password/${resetPasswordToken}`;

  const message = `Click on link to reset your password. ${resetUrl}. If you have not request then please ignore.`;

  // try {
  await sendEmail({
    email: user.email,
    subject: "Reset Password",
    message,
  });

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`,
    resetUrl,
  });
  // } catch (error) {
  //   user.resetPasswordToken = undefined;
  //   user.resetPasswordExpire = undefined;
  //   await user.save();
  // }
  // return res.status(500).json({ success: false, message: error.message });
});

export const resetpassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .toString("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired"));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Updated",
    token,
  });
});

export const addToPlayList = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const itemExit = await user.playlist.find((item) => {
    if (item.courseId.toString() === course._id.toString()) return true;
  });

  if (itemExit) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    courseId: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to playlist",
  });
});

export const removeFromPlayList = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.query.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const newPlayList = user.playlist.filter((item) => {
    if (item.courseId.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlayList;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Deleted From playlist",
  });
});

// Admin
export const getAllUser = catchAsyncError(async (req, res, next) => {
  const user = await User.find();
  res.status(201).json({
    status: true,
    user,
  });
});

export const updateRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (user.role === "admin") user.role = "user";
  else user.role = "admin";
  await user.save();
  res.status(201).json({
    status: true,
    message: "User Role Updated",
  });
});

// Subscription cancel pending...
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Cancel subscription: Pending....

  await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
    folder: "users",
  });

  await user.remove();
  res.status(201).json({
    status: true,
    message: "User Deleted Successfully",
  });
});

// Subscription pending...
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
    folder: "users",
  });

  // ------------------------ Cancel Subscription -------------------------------------

  await user.remove();
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: false,
    })
    .json({
      success: true,
      message: "Profile Deleted Sucessfully",
    });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  const subscription = await User.find({ "subscription.status": "active" });

  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
