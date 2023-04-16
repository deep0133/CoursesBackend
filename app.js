import express from "express";
import { config } from "dotenv";
import course from "./routes/courseRoute.js";
import user from "./routes/userRoute.js";
import payment from "./routes/paymentRoute.js";
import other from "./routes/otherRoute.js";
import ErrorMiddleware from "./middleware/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config({
  path: "./config/config.env",
});

const app = express();

// Meddlewares:
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);

// Routes:
app.use("/api/v1", user);
app.use("/api/v1", course);
app.use("/api/v1", payment);
app.use("/api/v1", other);

export default app;

app.get("/", (req, res) => {
  res.send(
    `<h1>Server is working. <a href=${process.env.FRONTEND_URL}>Click</a> to view Frontend Part.</h1>`
  );
});

app.use(ErrorMiddleware);
