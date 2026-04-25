import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  iconSize?: number; // Allow customization of the search icon size
}

export default function SearchInput({
  className,
  placeholder = "Search...",
  value,
  onChange,
  onKeyDown,
  iconSize = 16,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Input
        id="search-input"
        className={cn("peer pe-9 ps-9 w-full", className)}
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
        <Search size={iconSize} strokeWidth={2} />
      </div>
    </div>
  );
}
