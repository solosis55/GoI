import { PostActions } from "./PostActions";
import { CommentList } from "./CommentList";
import { PostComposer } from "./PostComposer";
import type { Post } from "../../types/post";

type PostItemProps = {
  post: Post;
  isOwner: boolean;
  currentUserId?: string;
  commentValue: string;
  onChangeComment: (value: string) => void;
  onLike: () => void;
  onDelete: () => void;
  onComment: () => void;
  getWorkoutTitle: (workoutId: string | null) => string | null;
  formatDate: (value: string) => string;
};

export function PostItem({
  post,
  isOwner,
  currentUserId,
  commentValue,
  onChangeComment,
  onLike,
  onDelete,
  onComment,
  getWorkoutTitle,
  formatDate,
}: PostItemProps) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3 max-md:flex-col">
      <div>
        <strong className="text-slate-100">
          {post.authorUsername}
          {isOwner ? " (tu)" : ""}
        </strong>
        <p className="mt-2 text-slate-400">{formatDate(post.createdAt)}</p>
        <p className="text-slate-200">{post.content}</p>
        {post.workoutId && <small className="text-slate-300">Entrenamiento: {getWorkoutTitle(post.workoutId)}</small>}
        <p className="mt-2 text-slate-400">Likes: {post.likesCount}</p>
        <CommentList comments={post.comments} currentUserId={currentUserId} />
        <PostComposer value={commentValue} onChange={onChangeComment} onSubmit={onComment} />
      </div>
      <PostActions isOwner={isOwner} onLike={onLike} onDelete={onDelete} />
    </li>
  );
}
