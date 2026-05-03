import { Router } from "express";
import {
  createComment,
  createPost,
  deletePost,
  listPosts,
  toggleLike,
} from "../controllers/postsController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.post("/", requireAuth, createPost);
postsRoutes.delete("/:id", requireAuth, deletePost);
postsRoutes.post("/:id/likes", requireAuth, toggleLike);
postsRoutes.post("/:id/comments", requireAuth, createComment);

export default postsRoutes;
