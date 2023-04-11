import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Course from "../models/Course.js";
import getDataUri from "../utils/DataUrl.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import cloudinary from "cloudinary";
import Stats from "../models/Stats.js";

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const category = req.query.category || "";
  const courses = await Course.find({
    title: {
      $regex: keyword,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  }).select("-lectures");
  res.json({ success: true, courses });
});

export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please add all fields", 400));

  const file = req.file;
  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    folder: "Free_Course",
  });

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Course Created",
  });
});

export const getCourseLecture = catchAsyncError(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) return next(new ErrorHandler("Course not found", 404));
  course.views += 1;
  await course.save();
  res.json({ success: true, lectures: course.lectures });
});

// Max Video Size : 100mb  ---->  free cloudinary service:
export const addLecture = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description)
    return next(new ErrorHandler("Required All Fields", 400));

  let course = await Course.findById(req.params.id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  // upload file to cloudnary:
  const file = req.file;
  const fileUri = getDataUri(file);

  let myCloud;
  try {
    myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      folder: "Free_Course",
      resource_type: "video",
    });
  } catch (error) {
    return next(
      new ErrorHandler("Error occured while uploading file in cloud", 500)
    );
  }

  const video = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  course.lectures.push({ title, description, video });
  course.noOfVideos = course.lectures.length;

  await course.save();
  res.json({ success: true, lectures: course.lectures });
});

export const deleteCourse = catchAsyncError(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  const lectures = course.lectures;

  for (let i = 0; i < lectures.length; i++) {
    const lecture = lectures[i];
    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
      resource_type: "video",
    });
  }

  await course.remove();

  res.json({ success: true, message: "Course Deleted" });
});

export const deleteLecture = catchAsyncError(async (req, res, next) => {
  const { lectureId, courseId } = req.query;
  let course = await Course.findById(courseId);

  if (!course) return next(new ErrorHandler("Lecture not found", 404));

  const lecture = course.lectures.find((item) => {
    if (item.video._id.toString() === lectureId.toString()) return item;
  });

  await cloudinary.v2.uploader.destroy(lecture.video.public_id);

  course.lectures = course.lectures.filter((lec) => {
    if (lec.video._id.toString() !== lectureId.toString()) {
      return lec;
    }
  });

  course.noOfVideos = course.lectures.length;

  await course.save();

  res.json({ success: true, message: "Course Deleted" });
});

Course.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const course = await Course.find({});

  let totalViews = 0;

  course.forEach((element) => {
    totalViews += element.views;
  });

  stats[0].views = totalViews;

  await stats[0].save();
});
