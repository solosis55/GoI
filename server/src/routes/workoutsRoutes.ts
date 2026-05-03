import { Router } from "express";
import {
  createWorkout,
  deleteWorkout,
  listWorkouts,
  updateWorkout,
} from "../controllers/workoutsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const workoutsRoutes = Router();

workoutsRoutes.get("/", listWorkouts);
workoutsRoutes.post("/", requireAuth, createWorkout);
workoutsRoutes.put("/:id", requireAuth, updateWorkout);
workoutsRoutes.delete("/:id", requireAuth, deleteWorkout);

export default workoutsRoutes;
