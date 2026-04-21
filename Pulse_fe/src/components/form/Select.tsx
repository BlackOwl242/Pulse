import { ChevronDownIcon } from "@/icons";
import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const currentValue = value !== undefined ? value : internalValue;
  const selectedLabel = options.find((o) => o.value === currentValue)?.label || placeholder;

  const handleSelect = (val: string) => {
    setInternalValue(val);
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`dropdown-toggle w-full text-left flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors ${
          currentValue ? "text-gray-900 dark:text-white" : "text-gray-400"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="shrink-0 text-gray-500 dark:text-gray-400 ml-2">
          <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-full mt-1 p-1 max-h-60 overflow-y-auto custom-scrollbar">
        {/* Placeholder option */}
        <button
          type="button"
          onClick={() => handleSelect("")}
          className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
            !currentValue
              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {placeholder}
        </button>

        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
              currentValue === opt.value
                ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </Dropdown>
    </div>
  );
};

export default Select;
