import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import workoutsRoutes from "./routes/workoutsRoutes.js";
import { initializeStore } from "./services/store.js";

dotenv.config();

const app = express();
initializeStore();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Backend running",
    docs: {
      health: "/api/health",
      auth: "/api/auth",
      workouts: "/api/workouts",
      posts: "/api/posts",
    },
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/posts", postsRoutes);

export default app;
