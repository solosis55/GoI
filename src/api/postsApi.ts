import { apiFetch } from "./client";
import type {
  CreateCommentInput,
  CreatePostInput,
  NotificationsResponse,
  Post,
  PostComment,
} from "../types/post";

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

export function updatePost(
  id: string,
  input: { content: string; visibility: "public" | "followers" | "private" },
) {
  return apiFetch<Post>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function toggleLike(postId: string) {
  return apiFetch<{ liked: boolean }>(`/posts/${postId}/likes`, {
    method: "POST",
  });
}

export function createComment(postId: string, input: CreateCommentInput) {
  return apiFetch<PostComment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getNotifications() {
  return apiFetch<NotificationsResponse>("/posts/notifications");
}

export function markNotificationsRead(body: { keys?: string[]; all?: boolean }) {
  return apiFetch<{ marked: number }>("/posts/notifications/read", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Tamaño por defecto de página para listados de publicaciones por usuario (perfil). */
export const PROFILE_POSTS_PAGE_SIZE = 24;

export type PostsByUserPageResponse = {
  posts: Post[];
  nextCursor: string | null;
  total: number;
};

export function getPostsByUser(userId: string) {
  return apiFetch<Post[]>(`/posts/by-user/${encodeURIComponent(userId)}`);
}

export function getPostsByUserPage(userId: string, opts: { limit: number; cursor?: string | null }) {
  const sp = new URLSearchParams();
  sp.set("limit", String(opts.limit));
  if (opts.cursor) sp.set("cursor", opts.cursor);
  return apiFetch<PostsByUserPageResponse>(
    `/posts/by-user/${encodeURIComponent(userId)}?${sp.toString()}`,
  );
}
