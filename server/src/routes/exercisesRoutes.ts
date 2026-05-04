import { Router } from "express";
import { getExerciseById, listExercises } from "../controllers/exercisesController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const exercisesRoutes = Router();

exercisesRoutes.get("/", requireAuth, listExercises);
exercisesRoutes.get("/:id", requireAuth, getExerciseById);

export default exercisesRoutes;
