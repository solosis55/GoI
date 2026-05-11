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
  className = "goi-field min-h-[2.75rem] w-full resize-none py-2 text-sm",
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
    <div className="mt-2 flex gap-2 max-[479px]:flex-col">
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
      <Button type="button" variant="secondary" className="shrink-0 self-end max-[479px]:w-full" onClick={onSubmit}>
        Comentar
      </Button>
    </div>
  );
}
