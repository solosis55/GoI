import { Avatar } from "../ui/Avatar";
import type { Post } from "../../types/post";

type StoriesRowProps = {
  posts: Post[];
};

export function StoriesRow({ posts }: StoriesRowProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {posts.slice(0, 8).map((post) => (
        <div key={`story-${post.id}`} className="grid min-w-[72px] place-items-center gap-1.5">
          <div className="rounded-full border-2 border-pink-500 p-0.5">
            <Avatar src={post.authorAvatarUrl} alt={post.authorUsername} size={44} />
          </div>
          <small className="text-slate-300">{post.authorUsername}</small>
        </div>
      ))}
    </div>
  );
}
