import React, { useState, useEffect } from "react";

interface RatingSliderProps {
  options: { label: string; value: number }[]; // Options from API response
  value?: number; // Pre-selected rating
}

const DisabledRatingSlider = ({ options, value }: RatingSliderProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(value || null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  return (
    <div className="w-full max-w-xl py-5">
      <div className="relative pt-3">
        {/* Line under rating buttons */}
        <div className="absolute top-[22px] left-6 right-6 flex justify-between">
          {options.slice(0, -1).map((_, i) => (
            <div key={i} className="h-0.5 flex-1 mt-[2px] bg-gray-200 transition-colors" />
          ))}
        </div>
        <div className="absolute top-0 left-0 right-0 flex justify-between px-6">
          {options.map((option) => (
            <div
              key={option.value}
              className={`
                flex h-12 w-12 items-center justify-center rounded-full border-2
                cursor-not-allowed transition-colors pointer-events-none
                ${
                  option.value === selectedValue
                    ? "border-secondary-500 bg-secondary-500 text-white"
                    : "border-gray-200 bg-white text-gray-400"
                }
              `}
            >
              {option.value}
            </div>
          ))}
        </div>
      </div>
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

export default DisabledRatingSlider;
