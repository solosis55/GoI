import { apiFetch } from "./client";
import type { CreateCommentInput, CreatePostInput, Post } from "../types/post";

export function getPosts() {
  return apiFetch<Post[]>("/posts");
}

export function createPost(input: CreatePostInput) {
  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deletePost(id: string) {
  return apiFetch<{ message: string }>(`/posts/${id}`, {
    method: "DELETE",
  });
}

export function toggleLike(postId: string) {
  return apiFetch<{ liked: boolean }>(`/posts/${postId}/likes`, {
    method: "POST",
  });
}

export function createComment(postId: string, input: CreateCommentInput) {
  return apiFetch<{ id: string }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
