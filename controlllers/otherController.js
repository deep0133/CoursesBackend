import { catchAsyncError } from "../middleware/catchAsyncError.js";
import sendEmail from "../middleware/sendMail.js";
import Stats from "../models/Stats.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("Please fill all fields", 400));

  const to = process.env.MY_EMAIL;
  const subject = "Contact from FreeCourses";
  const text = `I am ${name} and my email is ${email}.\n${message}`;
  await sendEmail({ email: to, subject, message: text });
  res.status(200).json({ success: true, message: "New message has been sent" });
});

export const requestCourse = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("Please fill all fields", 400));

  const to = process.env.MY_EMAIL;
  const subject = "Requesting for a Course on FreeCourses";
  const text = `I am ${name} and my email is ${email}.\n${course}`;
  await sendEmail({ email: to, subject, message: text });
  res.status(200).json({ success: true, message: "New Request has been sent" });
});

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

  const statsData = [];

  for (let index = 0; index < 12; index++) {
    if (index < stats.length) {
      const element = stats[index];
      statsData.unshift(element);
    } else {
      statsData.unshift({
        users: 0,
        subscription: 0,
        views: 0,
      });
    }
  }

  const countSubscription = statsData[11].subscription;
  const countViews = statsData[11].views;
  const countUsers = statsData[11].users;

  let userPercentage = -1;
  let viewsPercentage = -1;
  let subscriptionPercentage = -1;

  if (statsData[10].users == 0) userPercentage = countUsers * 100;
  else {
    if (statsData[10].users < statsData[11].users)
      userPercentage =
        ((statsData[11].users - statsData[10].users) * 100) /
        statsData[10].users;
  }

  if (statsData[10].subscription == 0)
    subscriptionPercentage = countSubscription * 100;
  else {
    if (statsData[10].subscription < statsData[11].subscription)
      subscriptionPercentage =
        ((statsData[11].subscription - statsData[10].subscription) * 100) /
        statsData[10].subscription;
  }

  if (statsData[10].views == 0) viewsPercentage = countViews * 100;
  else {
    if (statsData[10].views < statsData[11].views)
      viewsPercentage =
        ((statsData[11].views - statsData[10].views) * 100) /
        statsData[10].views;
  }

  res.status(200).json({
    success: true,
    countSubscription,
    countUsers,
    countViews,
    userPercentage,
    viewsPercentage,
    subscriptionPercentage,
    stats: statsData,
  });
});
