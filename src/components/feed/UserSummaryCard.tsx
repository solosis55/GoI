type UserSummaryCardProps = {
  username?: string;
  myPostsCount: number;
};

export function UserSummaryCard({ username, myPostsCount }: UserSummaryCardProps) {
  return (
    <>
      <h3>Tu cuenta</h3>
      <p className="mt-2 text-slate-400">
        @{username} | Publicaciones: {myPostsCount}
      </p>
    </>
  );
}
