import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  let { token } = req.cookies;
  if (!token) return next(new ErrorHandler("Login First", 401));

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded._id);
  next();
});

export const authenticateAdmin = catchAsyncError((req, res, next) => {
  if (req.user.role !== "admin")
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );

  next();
});

export const authorizeSubscriber = catchAsyncError((req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin")
    return next(new ErrorHandler(`Only Subscribers can access this.`, 403));

  next();
});
