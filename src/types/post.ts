export type Post = {
  id: string;
  userId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  workoutId: string | null;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  comments: PostComment[];
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = {
  userId: string;
  content: string;
  workoutId: string | null;
};

export type CreateCommentInput = {
  userId: string;
  content: string;
};
