export type SafeUser = {
  id: string;
  username: string;
  email: string;
  bio: string;
  goal: string;
  avatarUrl: string;
  bannerUrl: string;
  bannerShowInFeed: boolean;
  websiteUrl: string;
  instagramUrl: string;
  stravaUrl: string;
  location: string;
  profileVisibility: "public" | "followers";
  pinnedPostId: string;
  createdAt: string;
  updatedAt: string;
};

/** Respuesta de `GET /auth/profile/:id`: el correo solo va incluido si miras tu propio perfil. */
export type ProfileUser = Omit<SafeUser, "email"> & {
  email?: string;
  /** Perfil limitado hasta que el visitante siga a esta cuenta. */
  restrictedToFollowers?: boolean;
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

export type ForgotPasswordResponse = {
  message: string;
  /** Solo si el servidor tiene `AUTH_RESET_RETURN_TOKEN=true` (desarrollo). */
  devResetToken?: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type UpdateProfileInput = Partial<{
  username: string;
  bio: string;
  goal: string;
  avatarUrl: string;
  bannerUrl: string;
  bannerShowInFeed: boolean;
  websiteUrl: string;
  instagramUrl: string;
  stravaUrl: string;
  location: string;
  profileVisibility: "public" | "followers";
  pinnedPostId: string | null;
}>;

export type DiscoverUser = ProfileUser & {
  isFollowing: boolean;
};
