import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function connectDB() {
  const url = process.env.DB_URL || "mongodb://localhost:27017/freecourse";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
  }
}

export default connectDB;
