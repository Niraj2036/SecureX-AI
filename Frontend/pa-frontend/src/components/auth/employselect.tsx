"use client";

import { Label } from "@/components/ui/label";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useSessionStore from "@/store/signupStore";

const Employ = [
  {
    label: "1-25",
    value: "size_1_25",
  },
  {
    label: "25-100",
    value: "size_25_100",
  },
  {
    label: "100-200",
    value: "size_100_200",
  },
  {
    label: "200-500",
    value: "size_200_500",
  },
  {
    label: "500+",
    value: "size_500Plus",
  },
];

export default function Employselect() {
  const {setEmployeeSize,employeeSize} = useSessionStore((state) => state);
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(employeeSize || "");
  setEmployeeSize(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="select-41">
        Employ size<span className="text-red-500">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="select-41"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? Employ.find((framework) => framework.value === value)?.label
                : "Select your employee size range here"}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Select your employee size range here..." />
            <CommandList>
              <CommandEmpty>No Employee range found.</CommandEmpty>
              <CommandGroup>
                {Employ.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
