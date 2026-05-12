import { Button } from "../ui/Button";
import { MentionableTextarea } from "./MentionableTextarea";
import type { MentionPickUser } from "../../utils/mentionAutocomplete";

export type { MentionPickUser } from "../../utils/mentionAutocomplete";

export function MentionComposer({
  value,
  onChange,
  onSubmit,
  candidates,
  placeholder = "Escribe un comentario (@ para mencionar)",
  className = [
    "goi-field min-h-[2.75rem] w-full resize-none rounded-xl py-2.5 text-sm",
    "border-neutral-700/85 bg-black/35 placeholder:text-neutral-600",
    "light:border-zinc-300 light:bg-white light:placeholder:text-zinc-400",
  ].join(" "),
  rows = 2,
  maxLength = 180,
  onMentionPick,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  candidates: MentionPickUser[];
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  onMentionPick?: (picked: MentionPickUser) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      <MentionableTextarea
        value={value}
        onChange={onChange}
        candidates={candidates}
        rows={rows}
        maxLength={maxLength}
        onMentionPick={onMentionPick}
        className={[className, "min-w-0 flex-1"].join(" ")}
        placeholder={placeholder}
        onEnterSubmit={onSubmit}
        listPlacement="above"
      />
      <Button
        type="button"
        variant="primary"
        className={[
          "w-full shrink-0 self-center justify-center rounded-xl !min-h-[2.75rem] !px-6 !py-2 !text-sm !font-semibold",
          "shadow-[0_6px_20px_-6px_rgba(212,175,55,0.55)] transition hover:brightness-[1.05] active:scale-[0.99]",
          "sm:w-auto sm:min-w-[8.25rem] sm:self-auto",
        ].join(" ")}
        onClick={onSubmit}
      >
        Comentar
      </Button>
    </div>
  );
}
