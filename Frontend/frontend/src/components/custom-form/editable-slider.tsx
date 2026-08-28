import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RatingScaleType = "numeric" | "emoji" | "agreement";

interface RatingSliderProps {
  labels: string[];
  onLabelsChange: (labels: string[]) => void;
}

const defaultLabels = {
  numeric: ["Poor", "Below Average", "Average", "Good", "Excellent"],
  emoji: ["😠 Strongly Dislike", "🙁 Dislike", "😐 Neutral", "🙂 Like", "😍 Love It"],
  agreement: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
};

// Helper function to extract emoji and text
const extractEmojiAndText = (label: string) => {
  // This regex captures the emoji at the beginning and the rest of the text
  const match = label.match(/^(\p{Emoji})\s+(.+)$/u);
  if (match) {
    return {
      emoji: match[1],
      text: match[2]
    };
  }
  return {
    emoji: "",
    text: label
  };
};

const EditRatingSlider = ({ labels, onLabelsChange }: RatingSliderProps) => {
  const [scaleType, setScaleType] = useState<RatingScaleType>("numeric");
  const [editableLabels, setEditableLabels] = useState(labels);

  const handleLabelChange = (index: number, newLabel: string) => {
    const updatedLabels = [...editableLabels];
    if (scaleType === "emoji") {
      // Preserve the emoji when updating text
      const currentLabel = updatedLabels[index];
      const { emoji } = extractEmojiAndText(currentLabel);
      updatedLabels[index] = `${emoji} ${newLabel}`;
    } else {
      updatedLabels[index] = newLabel;
    }
    setEditableLabels(updatedLabels);
    onLabelsChange(updatedLabels);
  };

  const handleScaleTypeChange = (type: RatingScaleType) => {
    setScaleType(type);
    const newLabels = [...defaultLabels[type]];
    setEditableLabels(newLabels);
    onLabelsChange(newLabels);
  };

  const getCircleColor = (index: number, total: number) => {
    if (scaleType !== "agreement") return {};

    // Calculate gradient from red to green for agreement scale
    const hue = (index / (total - 1)) * 120; // 0 (red) to 120 (green)
    return { backgroundColor: `hsl(${hue}, 70%, 80%)` };
  };

  // Function to get only the emoji for circles
  const getCircleContent = (index: number) => {
    if (scaleType === "emoji") {
      const { emoji } = extractEmojiAndText(editableLabels[index]);
      return emoji;
    }
    return index + 1;
  };

  // Function to get only the text for inputs
  const getInputValue = (index: number) => {
    if (scaleType === "emoji") {
      const { text } = extractEmojiAndText(editableLabels[index]);
      return text;
    }
    return editableLabels[index];
  };

  return (
    <div className="w-full max-w-xl mx-auto ">
      <div className="flex items-center justify-between pb-4">
        <h3 className="font-medium">Add Answer</h3>
        <Select value={scaleType} onValueChange={(value) => handleScaleTypeChange(value as RatingScaleType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select scale type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="numeric">Numeric (1-5)</SelectItem>
            <SelectItem value="emoji">Emoji Scale</SelectItem>
            <SelectItem value="agreement">Agreement Scale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative pt-4">
        <div className="absolute top-[22px] left-6 right-6 flex justify-between">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`h-0.5 ${scaleType === "agreement" ? "bg-gradient-to-r from-red-200 via-yellow-200 to-green-200" : "bg-gray-200"} flex-1 mt-[2px]`}
            />
          ))}
        </div>

        <div className="absolute top-0 left-0 right-0 flex justify-between px-6">
          {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`
                flex h-12 w-12 items-center justify-center rounded-full border-2
                ${scaleType === "agreement" ? "border-transparent" : "border-gray-200"}
                bg-white text-gray-600 cursor-default
                transition-all duration-200 hover:scale-105
              `}
              style={getCircleColor(i, 5) as React.CSSProperties}
            >
              {getCircleContent(i)}
            </div>
          ))}
        </div>
      </div>

      {/* Editable Labels */}
      <div className="mt-10 grid grid-cols-5 gap-2">
        {editableLabels.map((label, i) => (
          <Input
            key={i}
            value={getInputValue(i)}
            onChange={(e) => handleLabelChange(i, e.target.value)}
            className={`text-center text-sm ${scaleType === "agreement" ? "font-medium" : ""}`}
            placeholder={`Label ${i + 1}`}
          />
        ))}
      </div>

      {/* Description based on selected type */}
      <div className="text-sm text-gray-500 italic pt-2">
        {scaleType === "numeric" && "Numeric scale from 1 (Poor) to 5 (Excellent)"}
        {scaleType === "emoji" && "Emoji scale from Strongly Dislike to Love It"}
        {scaleType === "agreement" && "Agreement scale from strongly disagree to strongly agree"}
      </div>
    </div>
  );
};

export default EditRatingSlider;