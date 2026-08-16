import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bolt, CopyPlus, Plus } from "lucide-react";


export default function DropdownDemo() {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="mr-2 h-6 w-6 p-[1px] bg-white/40 scale-150 text-white font-semibold rounded" />
            New Entry
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <CopyPlus
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              Create New Item
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bolt
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              Create from Template
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}