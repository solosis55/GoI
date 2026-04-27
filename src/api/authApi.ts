import { apiFetch } from "./client";
import type {
  AuthResponse,
  DiscoverUser,
  LoginInput,
  RegisterInput,
  SafeUser,
  UpdateProfileInput,
} from "../types/auth";

export function register(input: RegisterInput) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getProfile(userId: string) {
  return apiFetch<{ user: SafeUser }>(`/auth/profile/${userId}`);
}

export function updateProfile(userId: string, input: UpdateProfileInput) {
  return apiFetch<{ message: string; user: SafeUser }>(`/auth/profile/${userId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function getUsers(currentUserId: string) {
  return apiFetch<{ users: DiscoverUser[] }>(`/auth/users?currentUserId=${currentUserId}`);
}

export function getFollowing(userId: string) {
  return apiFetch<{ followingIds: string[] }>(`/auth/following/${userId}`);
}

export function toggleFollow(targetUserId: string, followerId: string) {
  return apiFetch<{ following: boolean }>(`/auth/follow/${targetUserId}`, {
    method: "POST",
    body: JSON.stringify({ followerId }),
  });
}
