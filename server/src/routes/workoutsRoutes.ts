import { Router } from "express";
import {
  createWorkout,
  deleteWorkout,
  listWorkouts,
  updateWorkout,
} from "../controllers/workoutsController.js";

const workoutsRoutes = Router();

workoutsRoutes.get("/", listWorkouts);
workoutsRoutes.post("/", createWorkout);
workoutsRoutes.put("/:id", updateWorkout);
workoutsRoutes.delete("/:id", deleteWorkout);

export default workoutsRoutes;
