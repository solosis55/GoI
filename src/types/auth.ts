export type SafeUser = {
  id: string;
  username: string;
  email: string;
  bio: string;
  goal: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  message: string;
  user: SafeUser;
  token?: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type UpdateProfileInput = {
  username: string;
  bio: string;
  goal: string;
  avatarUrl: string;
};

export type DiscoverUser = SafeUser & {
  isFollowing: boolean;
};
