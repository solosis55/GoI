import { Request, Response } from "express";
import { createId, saveStore, store, Post } from "../services/store.js";
import { sendError } from "../services/http.js";
import { isLengthBetween, sanitizeText } from "../services/validation.js";

type PostPayload = {
  content?: string;
  workoutId?: string | null;
};

type CommentPayload = {
  content?: string;
};

function mapPostWithInteractions(post: Post) {
  const author = store.users.find((user) => user.id === post.userId);
  const likes = store.likes.filter((like) => like.postId === post.id);
  const comments = store.comments
    .filter((comment) => comment.postId === post.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map((comment) => {
      const commentAuthor = store.users.find((user) => user.id === comment.userId);
      return {
        ...comment,
        authorUsername: commentAuthor?.username ?? "Usuario",
      };
    });

  return {
    ...post,
    authorUsername: author?.username ?? "Usuario",
    authorAvatarUrl: author?.avatarUrl ?? "",
    likesCount: likes.length,
    comments,
  };
}

export function listPosts(_req: Request, res: Response) {
  const posts = [...store.posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(posts.map(mapPostWithInteractions));
}

export function createPost(req: Request, res: Response) {
  const authUserId = String(res.locals.authUserId ?? "");
  const { content, workoutId = null } = req.body as PostPayload;
  const normalizedContent = sanitizeText(content);

  if (!authUserId || !isLengthBetween(normalizedContent, 4, 280)) {
    sendError(res, 400, "POST_INVALID_INPUT", "content is required");
    return;
  }

  const userExists = store.users.some((user) => user.id === authUserId);
  if (!userExists) {
    sendError(res, 404, "POST_USER_NOT_FOUND", "user not found");
    return;
  }

  if (workoutId) {
    const workoutExists = store.workouts.some((workout) => workout.id === workoutId);
    if (!workoutExists) {
      sendError(res, 404, "POST_WORKOUT_NOT_FOUND", "workout not found");
      return;
    }
  }

  const post: Post = {
    id: createId(),
    userId: authUserId,
    content: normalizedContent,
    workoutId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.posts.push(post);
  saveStore();
  res.status(201).json(mapPostWithInteractions(post));
}

export function deletePost(req: Request, res: Response) {
  const authUserId = String(res.locals.authUserId ?? "");
  const { id } = req.params;
  const index = store.posts.findIndex((post) => post.id === id);

  if (index === -1) {
    sendError(res, 404, "POST_NOT_FOUND", "post not found");
    return;
  }

  if (store.posts[index].userId !== authUserId) {
    sendError(res, 403, "POST_FORBIDDEN", "forbidden");
    return;
  }

  const postId = store.posts[index].id;
  const [removed] = store.posts.splice(index, 1);
  store.likes = store.likes.filter((like) => like.postId !== postId);
  store.comments = store.comments.filter((comment) => comment.postId !== postId);
  saveStore();
  res.json({ message: "post deleted", post: removed });
}

export function toggleLike(req: Request, res: Response) {
  const postId = String(req.params.id);
  const userId = String(res.locals.authUserId ?? "");
  if (!userId) {
    sendError(res, 401, "AUTH_UNAUTHORIZED", "unauthorized");
    return;
  }

  const postExists = store.posts.some((post) => post.id === postId);
  if (!postExists) {
    sendError(res, 404, "POST_NOT_FOUND", "post not found");
    return;
  }

  const userExists = store.users.some((user) => user.id === userId);
  if (!userExists) {
    sendError(res, 404, "POST_USER_NOT_FOUND", "user not found");
    return;
  }

  const existingLikeIndex = store.likes.findIndex((like) => like.postId === postId && like.userId === userId);

  if (existingLikeIndex >= 0) {
    store.likes.splice(existingLikeIndex, 1);
    saveStore();
    res.json({ liked: false });
    return;
  }

  store.likes.push({
    id: createId(),
    postId,
    userId,
    createdAt: new Date().toISOString(),
  });
  saveStore();
  res.json({ liked: true });
}

export function createComment(req: Request, res: Response) {
  const postId = String(req.params.id);
  const userId = String(res.locals.authUserId ?? "");
  const { content } = req.body as CommentPayload;
  const normalizedContent = sanitizeText(content);

  if (!userId || !isLengthBetween(normalizedContent, 1, 180)) {
    sendError(res, 400, "COMMENT_INVALID_INPUT", "content is required");
    return;
  }

  const postExists = store.posts.some((post) => post.id === postId);
  if (!postExists) {
    sendError(res, 404, "POST_NOT_FOUND", "post not found");
    return;
  }

  const userExists = store.users.some((user) => user.id === userId);
  if (!userExists) {
    sendError(res, 404, "COMMENT_USER_NOT_FOUND", "user not found");
    return;
  }

  const comment = {
    id: createId(),
    postId,
    userId,
    content: normalizedContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.comments.push(comment);
  saveStore();
  res.status(201).json(comment);
}
