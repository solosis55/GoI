import { useMemo, useState } from "react";
import type { MentionUserDirectory } from "../../utils/mentionText";
import { MentionHighlighted } from "../../utils/mentionText";

const READ_MORE_CHAR_THRESHOLD = 200;

type PostFeedTextProps = {
  content: string;
  mentionDirectory: MentionUserDirectory;
  onOpenProfile?: (userId: string) => void;
};

export function PostFeedText({ content, mentionDirectory, onOpenProfile }: PostFeedTextProps) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = content.trim();
  const longEnough = trimmed.length > READ_MORE_CHAR_THRESHOLD;

  const bodyClass = useMemo(
    () =>
      [
        "whitespace-pre-wrap rounded-xl border border-neutral-800/75 bg-black/30 px-3.5 py-3 text-[15px] leading-[1.7] text-goi-steel shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.04)] light:border-zinc-200 light:bg-zinc-50/95 light:text-zinc-800 light:shadow-none",
        !expanded && longEnough ? "line-clamp-5" : "",
      ].join(" "),
    [expanded, longEnough],
  );

  if (!trimmed) return null;

  return (
    <div>
      <div className={bodyClass}>
        <MentionHighlighted text={content} userDirectory={mentionDirectory} onOpenProfile={onOpenProfile} />
      </div>
      {longEnough ? (
        <button
          type="button"
          className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-goi-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goi-gold/35"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Mostrar menos" : "Leer más"}
        </button>
      ) : null}
    </div>
  );
}
