import React from 'react';
import { Input } from './input';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ 
  value, 
  onChange, 
  className 
}: ColorPickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-16 h-10 p-0 ${className}`}
      />
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}