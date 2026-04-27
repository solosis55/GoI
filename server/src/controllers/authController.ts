import { Request, Response } from "express";
import { createId, saveStore, store, User } from "../services/store.js";

type AuthPayload = {
  email?: string;
  password?: string;
  username?: string;
};

type UpdateProfilePayload = {
  username?: string;
  bio?: string;
  goal?: string;
  avatarUrl?: string;
};

type ToggleFollowPayload = {
  followerId?: string;
};

function sanitizeUser(user: User) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function register(req: Request, res: Response) {
  const { email, password, username } = req.body as AuthPayload;

  if (!email || !password || !username) {
    res.status(400).json({ message: "username, email and password are required" });
    return;
  }

  const exists = store.users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    res.status(409).json({ message: "email already in use" });
    return;
  }

  const user: User = {
    id: createId(),
    username,
    email,
    password,
    bio: "",
    goal: "",
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.users.push(user);
  saveStore();
  res.status(201).json({
    message: "user registered",
    user: sanitizeUser(user),
  });
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body as AuthPayload;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  const user = store.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    res.status(401).json({ message: "invalid credentials" });
    return;
  }

  res.json({
    message: "login successful",
    user: sanitizeUser(user),
    token: `dev-token-${user.id}`,
  });
}

export function getProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const user = store.users.find((item) => item.id === userId);

  if (!user) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  res.json({
    user: sanitizeUser(user),
  });
}

export function updateProfile(req: Request, res: Response) {
  const { userId } = req.params;
  const { username, bio, goal, avatarUrl } = req.body as UpdateProfilePayload;
  const user = store.users.find((item) => item.id === userId);

  if (!user) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  if (username !== undefined) user.username = username;
  if (bio !== undefined) user.bio = bio;
  if (goal !== undefined) user.goal = goal;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  user.updatedAt = new Date().toISOString();

  saveStore();
  res.json({
    message: "profile updated",
    user: sanitizeUser(user),
  });
}

export function listUsers(req: Request, res: Response) {
  const currentUserId = typeof req.query.currentUserId === "string" ? req.query.currentUserId : "";
  const users = store.users
    .filter((user) => user.id !== currentUserId)
    .map((user) => {
      const isFollowing = store.follows.some(
        (follow) => follow.followerId === currentUserId && follow.followingId === user.id
      );
      return {
        ...sanitizeUser(user),
        isFollowing,
      };
    });

  res.json({ users });
}

export function getFollowing(req: Request, res: Response) {
  const { userId } = req.params;
  const followingIds = store.follows
    .filter((follow) => follow.followerId === userId)
    .map((follow) => follow.followingId);
  res.json({ followingIds });
}

export function toggleFollow(req: Request, res: Response) {
  const targetUserId = String(req.params.targetUserId);
  const { followerId } = req.body as ToggleFollowPayload;

  if (!followerId) {
    res.status(400).json({ message: "followerId is required" });
    return;
  }
  if (followerId === targetUserId) {
    res.status(400).json({ message: "cannot follow yourself" });
    return;
  }

  const followerExists = store.users.some((user) => user.id === followerId);
  const targetExists = store.users.some((user) => user.id === targetUserId);
  if (!followerExists || !targetExists) {
    res.status(404).json({ message: "user not found" });
    return;
  }

  const existingIndex = store.follows.findIndex(
    (follow) => follow.followerId === followerId && follow.followingId === targetUserId
  );
  if (existingIndex >= 0) {
    store.follows.splice(existingIndex, 1);
    saveStore();
    res.json({ following: false });
    return;
  }

  store.follows.push({
    id: createId(),
    followerId,
    followingId: targetUserId,
    createdAt: new Date().toISOString(),
  });
  saveStore();
  res.json({ following: true });
}
