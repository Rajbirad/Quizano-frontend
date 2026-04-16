import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';

interface RegenerateQuizToggleProps {
  show: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function RegenerateQuizToggle({
  show,
  checked,
  onCheckedChange,
  label = "Regenerate Quiz",
  description = "Force generate a new quiz even if this content was previously processed",
  className = ""
}: RegenerateQuizToggleProps) {
  if (!show) return null;

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 ${className}`}>
      <div className="flex items-start gap-3 flex-1">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <label className="text-sm font-medium text-amber-900 dark:text-amber-100">
            {label}
          </label>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="flex-shrink-0"
      />
    </div>
  );
}
