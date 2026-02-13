import { useRouter } from "next/router";
import { Button } from "../ui/Button";

export interface ActionsBarProps {
  onCompose?: () => void;
}

export function ActionsBar({ onCompose }: ActionsBarProps) {
  const router = useRouter();

  const handleComposeClick = () => {
    if (onCompose) {
      onCompose();
      return;
    }
    void router.push("/app/compose");
  };

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Button
        size="sm"
        variant="secondary"
        className="rounded-2xl px-3"
        onClick={handleComposeClick}
      >
        Compose
      </Button>
    </div>
  );
}

