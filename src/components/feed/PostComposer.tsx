import { Button } from "../ui/Button";

type PostComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function PostComposer({ value, onChange, onSubmit }: PostComposerProps) {
  return (
    <div className="inline-actions mt-2 flex gap-2">
      <input
        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-violet-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escribe un comentario"
      />
      <Button type="button" variant="secondary" onClick={onSubmit}>
        Comentar
      </Button>
    </div>
  );
}
