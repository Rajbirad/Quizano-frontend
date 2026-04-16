import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuestionTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const QuestionTypeSelector = ({ 
  value, 
  onValueChange, 
  disabled = false,
  label = "Question type",
  className = ""
}: QuestionTypeSelectorProps) => {
  // Normalize value to lowercase-with-hyphens format
  const normalizedValue = value.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
  
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
          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
          <SelectItem value="true-false">True/False</SelectItem>
          <SelectItem value="short-answer">Short Answer</SelectItem>
          <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
          <SelectItem value="mixed">Mixed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
