import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="space-y-3" data-testid="progress-container">
      <Progress value={progress} className="h-2" data-testid="progress-bar" />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" data-testid="text-status">{status}</p>
        <p className="text-xs text-muted-foreground font-mono" data-testid="text-percentage">{progress}%</p>
      </div>
    </div>
  );
}
