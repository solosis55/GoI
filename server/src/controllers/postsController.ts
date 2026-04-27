import { Request, Response } from "express";
import { createId, saveStore, store, Post } from "../services/store.js";

type PostPayload = {
  userId?: string;
  content?: string;
  workoutId?: string | null;
};

type ToggleLikePayload = {
  userId?: string;
};

type CommentPayload = {
  userId?: string;
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
  const { userId, content, workoutId = null } = req.body as PostPayload;

  if (!userId || !content?.trim()) {
    res.status(400).json({ message: "userId and content are required" });
    return;
  }

  const userExists = store.users.some((user) => user.id === userId);
  if (!userExists) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  if (workoutId) {
    const workoutExists = store.workouts.some((workout) => workout.id === workoutId);
    if (!workoutExists) {
      res.status(404).json({ message: "workout not found" });
      return;
    }
  }

  const post: Post = {
    id: createId(),
    userId,
    content: content.trim(),
    workoutId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.posts.push(post);
  saveStore();
  res.status(201).json(mapPostWithInteractions(post));
}

export function deletePost(req: Request, res: Response) {
  const { id } = req.params;
  const index = store.posts.findIndex((post) => post.id === id);

  if (index === -1) {
    res.status(404).json({ message: "post not found" });
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
  const { userId } = req.body as ToggleLikePayload;

  if (!userId) {
    res.status(400).json({ message: "userId is required" });
    return;
  }

  const postExists = store.posts.some((post) => post.id === postId);
  if (!postExists) {
    res.status(404).json({ message: "post not found" });
    return;
  }

  const userExists = store.users.some((user) => user.id === userId);
  if (!userExists) {
    res.status(404).json({ message: "user not found" });
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
  const { userId, content } = req.body as CommentPayload;

  if (!userId || !content?.trim()) {
    res.status(400).json({ message: "userId and content are required" });
    return;
  }

  const postExists = store.posts.some((post) => post.id === postId);
  if (!postExists) {
    res.status(404).json({ message: "post not found" });
    return;
  }

  const userExists = store.users.some((user) => user.id === userId);
  if (!userExists) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  const comment = {
    id: createId(),
    postId,
    userId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.comments.push(comment);
  saveStore();
  res.status(201).json(comment);
}
