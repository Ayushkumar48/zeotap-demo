import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function FormInputField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  error,
  required = false,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
