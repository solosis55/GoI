import { Router } from "express";
import { getPersonalRoadmap, putPersonalRoadmap } from "../controllers/personalRoadmapController.js";

const personalRoadmapRoutes = Router();

personalRoadmapRoutes.get("/", getPersonalRoadmap);
personalRoadmapRoutes.put("/", putPersonalRoadmap);

export default personalRoadmapRoutes;
