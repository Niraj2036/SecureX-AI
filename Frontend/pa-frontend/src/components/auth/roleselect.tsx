"use client";

import { Label } from "@/components/ui/label";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import company from "../../../public/auth/company.png";
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

const Roles = [
  {
    label: "Marketing and Sales",
    value: "marketing_sales",
  },
  {
    label: "IT - Information technology",
    value: "it",
  },
  {
    label: "Human Resource",
    value: "human-resource",
  },
  {
    label: "Consultant",
    value: "consultant",
  },
  {
    label: "Creative and Design",
    value: "creative-design",
  },
  {
    label: "Software Developer",
    value: "software-developer",
  },
  {
    label: "Other",
    value: "other",
  },
];

export default function RoleSelect() {
  const {setDesignation,designation} = useSessionStore((state) => state);


  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(designation || "");
  setDesignation(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="select-41">
        Role<span className="text-red-500">*</span>
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
                ? Roles.find((framework) => framework.value === value)?.label
                : "Select your role here"}
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
            <CommandInput placeholder="Search your role here..." />
            <CommandList>
              <CommandEmpty>No Role found.</CommandEmpty>
              <CommandGroup>
                {Roles.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Image
                      src={company}
                      alt="Company Logo"
                      className="shrink-0 w-7 h-auto"
                    />
                    <span>{framework.label}</span>
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
