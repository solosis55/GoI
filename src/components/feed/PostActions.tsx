import { Button } from "../ui/Button";

type PostActionsProps = {
  isOwner: boolean;
  onLike: () => void;
  onDelete: () => void;
};

export function PostActions({ isOwner, onLike, onDelete }: PostActionsProps) {
  return (
    <div className="actions flex gap-2">
      <Button type="button" variant="secondary" onClick={onLike}>
        Like
      </Button>
      {isOwner && (
        <Button type="button" variant="danger" onClick={onDelete}>
          Eliminar
        </Button>
      )}
    </div>
  );
}
