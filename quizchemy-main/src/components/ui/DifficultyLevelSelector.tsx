import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DifficultyLevelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  includeVeryHard?: boolean; // Include "Very Hard" option
  includeMixed?: boolean; // Include "Mixed" option
}

export const DifficultyLevelSelector = ({ 
  value, 
  onValueChange, 
  disabled = false,
  label = "Difficulty Level",
  className = "",
  includeVeryHard = false,
  includeMixed = false
}: DifficultyLevelSelectorProps) => {
  // Normalize value to lowercase format
  const normalizedValue = value.toLowerCase();
  
  const handleChange = (newValue: string) => {
    onValueChange(newValue);
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <Select value={normalizedValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger className="w-full h-12">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
          {includeVeryHard && <SelectItem value="very-hard">Very Hard</SelectItem>}
          <SelectItem value="expert">Expert</SelectItem>
          {includeMixed && <SelectItem value="mixed">Mixed</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
};
