import { Switch } from '@/components/ui/switch';

interface IncludeExplanationsSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function IncludeExplanationsSwitch({
  checked,
  onCheckedChange,
  label = "Include explanations for correct answers",
  className = ""
}: IncludeExplanationsSwitchProps) {
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
