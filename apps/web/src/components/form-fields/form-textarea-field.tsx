import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type TextareaFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function FormTextareaField({
  id,
  label,
  placeholder,
  rows = 4,
  value,
  onChange,
  error,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
