import React, { useState, useEffect } from "react";

interface RatingSliderProps {
  options: { label: string; value: number }[]; // Options from the API response
  value?: number; // Optional: To show a pre-selected rating
  onChange?: (value: number) => void; // Callback to pass the selected value to the parent
}

const RatingSlider = ({ options, value, onChange }: RatingSliderProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleClick = (newValue: number) => {
    setSelectedValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full max-w-xl py-5">
      <div className="relative pt-3">
        {/* Dynamic Line */}
        <div className="absolute top-[22px] left-6 right-6 flex justify-between">
          {[...Array(options.length - 1)].map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 mt-[2px] bg-gray-200 transition-colors"
            />
          ))}
        </div>
        <div className="absolute top-0 left-0 right-0 flex justify-between px-6">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              className={`
                flex h-12 w-12 items-center justify-center rounded-full border-2
                cursor-pointer transition-colors
                ${
                  option.value === selectedValue
                    ? "border-secondary-500 bg-secondary-50 text-secondary-700"
                    : "border-gray-200 bg-white text-gray-600"
                }
              `}
            >
              {option.value}
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="mt-10 grid grid-cols-5 gap-2">
        {options.map((option) => (
          <div key={option.value} className="text-center text-sm text-gray-600">
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingSlider;
