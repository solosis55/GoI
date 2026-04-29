import { Button } from "../ui/Button";

type FeedModeTabsProps = {
  mode: "all" | "following";
  onChangeMode: (mode: "all" | "following") => void;
};

export function FeedModeTabs({ mode, onChangeMode }: FeedModeTabsProps) {
  return (
    <div className="actions flex gap-2">
      <Button type="button" variant={mode === "all" ? "navActive" : "secondary"} onClick={() => onChangeMode("all")}>
        Todos
      </Button>
      <Button
        type="button"
        variant={mode === "following" ? "navActive" : "secondary"}
        onClick={() => onChangeMode("following")}
      >
        Seguidos
      </Button>
    </div>
  );
}
