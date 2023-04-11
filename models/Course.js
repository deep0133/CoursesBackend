import mongoose from "mongoose";
const { Schema } = mongoose;

const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, "Please enter course title"],
    minLength: [3, "Title must be least 3 characters"],
    maxLength: [40, "Title can't exceed 40 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter course description"],
    minLength: [10, "Description must be least 10 characters"],
  },
  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      video: {
        public_id: { type: String, require: true },
        url: { type: String, require: true },
      },
    },
  ],
  poster: {
    public_id: { type: String, require: true },
    url: { type: String, require: true },
  },
  views: {
    type: Number,
    default: 0,
  },
  noOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, "Enter Creator Name"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Course = mongoose.model("course", courseSchema);
export default Course;
