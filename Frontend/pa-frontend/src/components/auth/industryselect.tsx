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
import useSessionStore from "@/store/signupStore";
import { cn } from "@/lib/utils";

const Industry = [
  {
    label: "Healthcare Industry",
    value: "healthcare_industry",
  },
  {
    label: "Financial Services Industry",
    value: "financial_services_industry",
  },
  {
    label: "Manufacturing Industry",
    value: "manufacturing_industry",
  },
  {
    label: "Retail Industry",
    value: "retail_industry",
  },
];

export default function IndustrySelect() {
  const {setIndustry,industry} = useSessionStore((state) => state);
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(industry || "");
  setIndustry(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="select-41">
        Industry<span className="text-red-500">*</span>
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
                ? Industry.find((framework) => framework.value === value)?.label
                : "Search your business industry here..."}
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
            <CommandInput placeholder="Search your business industry here..." />
            <CommandList>
              <CommandEmpty>No Industry found.</CommandEmpty>
              <CommandGroup>
                {Industry.map((framework) => (
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
