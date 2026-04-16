import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  triggerClassName?: string;
  useLowercase?: boolean; // For files that use "english" instead of "English"
}

export const LanguageSelector = ({ 
  value, 
  onValueChange, 
  disabled = false,
  label = "Language",
  className = "",
  triggerClassName = "",
  useLowercase = false
}: LanguageSelectorProps) => {
  const languages = [
    { key: "Auto", display: "Auto" },
    { key: "English", display: "English" },
    { key: "Chinese", display: "简体中文" },
    { key: "Hindi", display: "हिन्दी" },
    { key: "Spanish", display: "Español" },
    { key: "French", display: "Français" },
    { key: "Urdu", display: "اردو" },
    { key: "Telugu", display: "తెలుగు" },
    { key: "Marathi", display: "मराठी" },
    { key: "Bengali", display: "বাংলা" },
    { key: "Tamil", display: "தமிழ்" },
    { key: "Portuguese", display: "Português" },
    { key: "Russian", display: "Русский" },
    { key: "Japanese", display: "日本語" },
    { key: "Korean", display: "한국어" },
    { key: "German", display: "Deutsch" },
    { key: "Italian", display: "Italiano" },
    { key: "Arabic", display: "العربية" },
    { key: "Vietnamese", display: "Tiếng Việt" },
    { key: "Turkish", display: "Türkçe" },
    { key: "Polish", display: "Polski" },
    { key: "Indonesian", display: "Bahasa Indonesia" },
    { key: "Thai", display: "ภาษาไทย" },
    { key: "Gujarati", display: "ગુજરાતી" },
    { key: "Kannada", display: "ಕನ್ನಡ" },
    { key: "Malayalam", display: "മലയാളം" },
    { key: "Punjabi", display: "ਪੰਜਾਬੀ" },
  ];

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={`w-full h-12 ${triggerClassName}`}>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map(({ key, display }) => (
            <SelectItem key={key} value={useLowercase ? key.toLowerCase() : key}>
              {display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
