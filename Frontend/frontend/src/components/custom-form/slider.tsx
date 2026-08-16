import React from "react";
import { Slider } from "@/components/ui/slider";

interface RatingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const RatingSlider = ({ value, onValueChange }: RatingSliderProps) => {
  const labels = ["Very Bad", "So So", "Normal", "Good", "Very Good"];

  return (
    <div className="w-full max-w-xl py-8">
      <div className="relative pt-6">
        <Slider
          value={[value]}
          onValueChange={(vals) => onValueChange(vals[0])}
          min={1}
          max={5}
          step={1}
          className="relative z-10 opacity-0"
          aria-label="Rating"
        />

        {/* Background line  */}
        <div className="absolute top-[22px] left-6 right-6 flex justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-0.5 bg-gray-200 flex-1 mt-[2px]" />
          ))}
        </div>

        {/* Circles with numbers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-6">
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              onClick={() => onValueChange(num)}
              className={`
                flex h-12 w-12 items-center justify-center rounded-full border-2
                transition-colors duration-200 cursor-pointer z-20
                ${
                  value === num
                    ? "border-teal-600 bg-button-gradient text-white"
                    : "border-gray-200 bg-white text-gray-600"
                }
              `}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Labels */}
        <div className="absolute top-14 left-0 right-0 flex justify-between px-6">
          {labels.map((label, i) => (
            <div key={label} className="w-12 text-center">
              <span
                className={`text-sm transition-colors duration-200 block whitespace-nowrap ${
                  value === i + 1 ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSlider;