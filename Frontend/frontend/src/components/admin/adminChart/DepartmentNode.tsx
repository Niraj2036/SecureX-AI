import { Building } from "lucide-react";
import { Handle, Position } from "reactflow";

const DepartmentNode = ({ data }: any) => {
    return (
        <div
            className="bg-card backdrop-blur-lg border border-border/80 transition-all duration-300 hover:shadow-xl hover:border-amber-500/50 w-[280px] rounded-2xl p-4 shadow-md text-left cursor-pointer"
            onClick={()=>data.toggleTeams(data.id)}
        >
            <div className="font-bold text-foreground flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                        <Building className="h-4 w-4" />
                    </div>
                    {data.name}
                </div>
            </div>
            <div className="flex pt-2 font-semibold text-xs text-muted-foreground">
                {data.users || "0"} Teams
            </div>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
};

export default DepartmentNode;