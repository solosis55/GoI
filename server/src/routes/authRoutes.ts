import { Router } from "express";
import {
  getFollowing,
  getProfile,
  listUsers,
  login,
  register,
  toggleFollow,
  updateProfile,
} from "../controllers/authController.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/users", listUsers);
authRoutes.get("/profile/:userId", getProfile);
authRoutes.put("/profile/:userId", updateProfile);
authRoutes.get("/following/:userId", getFollowing);
authRoutes.post("/follow/:targetUserId", toggleFollow);

export default authRoutes;
