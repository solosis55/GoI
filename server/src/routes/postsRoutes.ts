import { Router } from "express";
import {
  createComment,
  createPost,
  deletePost,
  listPosts,
  toggleLike,
} from "../controllers/postsController.js";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.post("/", createPost);
postsRoutes.delete("/:id", deletePost);
postsRoutes.post("/:id/likes", toggleLike);
postsRoutes.post("/:id/comments", createComment);

export default postsRoutes;
