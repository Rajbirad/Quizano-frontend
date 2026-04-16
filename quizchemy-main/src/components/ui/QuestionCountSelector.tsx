import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionCountSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  maxCount?: number; // Maximum count to show (default 25)
}

export const QuestionCountSelector = ({ 
  value, 
  onValueChange, 
  disabled = false,
  label = "No of Question",
  className = "",
  maxCount = 25
}: QuestionCountSelectorProps) => {
  const counts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].filter(count => count <= maxCount);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full h-12">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {counts.map(count => (
            <SelectItem key={count} value={count.toString()}>
              {count >= 15 ? `${count} (For Paid Subscribers)` : count}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
