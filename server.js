import app from "./app.js";
import connectDB from "./config/db.js";
const port = process.env.PORT || 4000;
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCrone from "node-cron";
import Stats from "./models/Stats.js";
// Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Payment instance:
export const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});

//   * means ----->>>  sec min hr day month year:
nodeCrone.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log("Error : " + error.message);
  }
});

// connection:
const connect = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log("Server Working");
  });
};
connect();
